'use strict';

////////////////////////////////////////////////////////////////////////////////

const Application = function () {
    this.backUrl = '/api';
    this.baseInfo = null;
    this.incList = [];
    this.comList = [];
};

const proto = Application.prototype;

proto.popupMenu = function (event) {
    const target = event.currentTarget;
    const group1 = [{ text: '删除', color: 'danger', onClick: () => this.deleteTask(target.id) }];
    do {
        let item = this.incList.find(e => e.id == target.id);
        if (!item) break;
        if (item.state == 9) {
            group1.unshift({ text: '继续', onClick: () => this.startTask(target.id) });
        } else if (!item.state) {
            group1.unshift({ text: '暂停', onClick: () => this.pauseTask(target.id) });
        }
    } while (0);
    const group2 = [{ text: '取消', bg: 'danger' }];
    return $.actions([group1, group2]);
};

proto.genCode = function (taskId, filename, size, speed, progress, state) {
    size = (size / 1024 / 1024).toFixed(2);
    speed = (speed / 1024).toFixed(2);
    progress = (progress / 100).toFixed(2);
    var icon = 'icon-cart';
    if (state == 9) icon = 'icon-clock';
    else if (state == 11) icon = 'icon-check';
    else if (!state) icon = 'icon-download';
    return `<div class="list-block" id="${taskId}">
    <ul>
      <li class="item-content">
        <div class="item-media">
          <span class="icon ${icon}"></span>
        </div>
        <div class="item-inner">
          <div class="item-title">${filename}</div>
        </div>
      </li>
      <li class="item-content">
        <div class="item-inner">
          <div class="item-title">大小</div>
          <div class="item-after">${size}MB</div>
        </div>
      </li>
      <li class="item-content">
        <div class="item-inner">
          <div class="item-title">速度</div>
          <div class="item-after">${speed}KB/s</div>
        </div>
      </li>
      <li class="item-content">
        <div class="item-inner">
          <div class="item-title">完成</div>
          <div class="item-after">${progress}%</div>
        </div>
      </li>
    </ul>
    </div>`;
};

proto.updateList = function (next) {
    try {
        $.get(this.backUrl + '/list?v=2&type=0&pos=0&number=999999&needUrl=1&abs_path=1&fixed_id=0', res => {
            var baseInfo = JSON.parse(res);
            this.incList = baseInfo.tasks;
            if (!this.baseInfo) {
                this.baseInfo = baseInfo;
                if (baseInfo.completeNum > 0) {
                    $.get(this.backUrl + '/list?v=2&type=1&pos=0&number=999999&needUrl=1&abs_path=1&fixed_id=0', res => {
                        var baseInfo = JSON.parse(res);
                        this.comList = baseInfo.tasks;
                        return next();
                    }).onerror = next;
                } else return next();
            }
            else {
                if (baseInfo.completeNum != this.baseInfo.completeNum) {
                    $.get(this.backUrl + '/list?v=2&type=1&pos=0&number=999999&needUrl=1&abs_path=1&fixed_id=0', res => {
                        var baseInfo = this.baseInfo = JSON.parse(res);
                        this.comList = baseInfo.tasks;
                        return next();
                    }).onerror = next;
                } else return next();
            }
        }).onerror = next;
    } catch (error) {
        console.warn('updateList Exception!');
        return next();
    }
}

proto.updateUI = function () {
    $('#content').empty();
    var htmlCode = '';
    this.incList.forEach(e => {
        var name = decodeURIComponent(e.name);
        var html = this.genCode(e.id, name, e.size, e.speed, e.progress, e.state);
        htmlCode += html;
    });
    this.comList.forEach(e => {
        var name = decodeURIComponent(e.name);
        var html = this.genCode(e.id, name, e.size, e.speed, e.progress, e.state);
        htmlCode += html;
    });
    if (htmlCode) $('#content').append(htmlCode);
};

proto.createTask = function (url, name) {
    if (!url) return $.toast('Create failure!');
    url = decodeURIComponent(url);
    if (!name) {
        let regex = url.match(/^.+\/([^\?]*).*$/);
        if (regex) name = regex[1];
    }
    if (!name) return $.toast('Create failure!');
    url = encodeURIComponent(url);
    name = encodeURIComponent(decodeURIComponent(name));
    try {
        $.get(this.backUrl + `/createOne?v=2&type=1&url=${url}&path=C:/TDDOWNLOAD/&name=${name}&fixed_id=1`, res => {
            var result = JSON.parse(res);
            if (!result.rtn) return $.toast('Create success!');
            else return $.toast('Create failure!');
        });
    } catch (error) {
        console.warn('createTask Exception!');
        return $.toast('Create failure!');
    }
};

proto.getSpace = function (next) {
    try {
        $.get(this.backUrl + '/boxSpace?v=2', res => {
            var result = JSON.parse(res);
            if (!result.rtn) {
                let disk = result.space[0];
                if (disk) {
                    return next((disk.remain / 1024 / 1024).toFixed(2));
                }
            }
            return next(0);
        });
    } catch (error) {
        console.warn('getSpace Exception!');
        return next(0);
    }
};

proto.startTask = function (taskId) {
    var item = this.incList.find(e => e.id == taskId);
    if (!item) return $.toast('Start failure!');
    if (item.state != 9) {
        return $.toast('Start failure!');
    }
    try {
        $.get(this.backUrl + `/start?tasks=${taskId}&v=2`, res => {
            var result = JSON.parse(res);
            if (!result.rtn) return $.toast('Start success!');
            else return $.toast('Start failure!');
        });
    } catch (error) {
        console.warn('Start Exception!');
        return $.toast('Start failure!');
    }
}

proto.pauseTask = function (taskId) {
    var item = this.incList.find(e => e.id == taskId);
    if (!item) return $.toast('Pause failure!');
    if (item.state) {
        return $.toast('Pause failure!');
    }
    try {
        $.get(this.backUrl + `/pause?tasks=${taskId}&v=2`, res => {
            var result = JSON.parse(res);
            if (!result.rtn) return $.toast('Pause success!');
            else return $.toast('Pause failure!');
        });
    } catch (error) {
        console.warn('Pause Exception!');
        return $.toast('Pause failure!');
    }
}

proto.deleteTask = function (taskId) {
    var item = this.incList.find(e => e.id == taskId);
    if (!item) {
        item = this.comList.find(e => e.id == taskId);
    }
    if (!item) return $.toast('Delete failure!');
    try {
        $.get(this.backUrl + `/del?tasks=${taskId}&v=2&deleteFile=1`, res => {
            var result = JSON.parse(res);
            if (!result.rtn) return $.toast('Delete success!');
            else return $.toast('Delete failure!');
        });
    } catch (error) {
        console.warn('deleteTask Exception!');
        return $.toast('Delete failure!');
    }
};

////////////////////////////////////////////////////////////////////////////////

const app = new Application();

function schemeUpdate() {
    var timer = setTimeout(() => {
        clearTimeout(timer);
        var timeout = setTimeout(schemeUpdate, 5000);
        app.updateList(() => {
            app.updateUI();
            clearTimeout(timeout);
            return schemeUpdate();
        });
    }, 2000);
}

////////////////////////////////////////////////////////////////////////////////

(function () {
    $(document).on('click', '.content .list-block', event => app.popupMenu(event));
    $(document).on('open', '.popup-newtask', () => {
        $('#downurl').val('');
        $('#filename').val('');
        return app.getSpace(size => $('#freespace').text(size));
    });
    $(document).on('click', '#startdown', () => {
        const url = $('#downurl').val().trim();
        const filename = $('#filename').val().trim();
        return app.createTask(url, filename);
    });
    $("#downurl").bind('input propertychange change', event => {
        const regex = event.currentTarget.value.match(/^.+\/([^\?]*).*$/);
        if (regex && regex[1]) return $('#filename').val(regex[1].trim());
    });
    $(document).on('click', '#dark', () => {
        const page = $('.page-group'), popup = $('.popup');
        if (page.hasClass('theme-dark')) {
            page.removeClass('theme-dark'); popup.removeClass('theme-dark');
        } else {
            page.addClass('theme-dark'); popup.addClass('theme-dark');
        }
    });
})();

