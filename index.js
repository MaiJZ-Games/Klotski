/**
 * Auther: MaiJZ
 * Date: 2017/4/13
 * Github: https://github.com/maijz128
 */

(function () {
    var ie = !!(window.attachEvent && !window.opera);
    var wk = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525);
    var fn = [];
    var run = function () {
        for (var i = 0; i < fn.length; i++) fn[i]();
    };
    var d = document;
    d.ready = function (f) {
        if (!ie && !wk && d.addEventListener)
            return d.addEventListener('DOMContentLoaded', f, false);
        if (fn.push(f) > 1) return;
        if (ie)
            (function () {
                try {
                    d.documentElement.doScroll('left');
                    run();
                }
                catch (err) {
                    setTimeout(arguments.callee, 0);
                }
            })();
        else if (wk)
            var t = setInterval(function () {
                if (/^(loaded|complete)$/.test(d.readyState))
                    clearInterval(t), run();
            }, 0);
    };
})();


function Chessman(id, left, top, organization) {
    this.position = {left: left, top: top};
    this.id = id || parseInt(Math.random() * 0xFFFFFFFF);
    this.organization = organization;
}
Chessman.prototype.setPosition = function (left, top) {
    this.position.left = left;
    this.position.top = top;
};
Chessman.prototype.getPosition = function () {
    var position = {left: 0, top: 0};
    position.left = this.position.left;
    position.top = this.position.top;
    if (this.organization) {
        const parentPosition = this.organization.getPosition();
        position.left += parentPosition.left;
        position.top += parentPosition.top;
    }
    return position;
};
Chessman.prototype.offset = function (left, top) {
    this.position.left += left;
    this.position.top += top;
};


function Collection(id, left, top, organization) {
    this.position = {left: left, top: top};
    this.id = id || parseInt(Math.random() * 0xFFFFFFFF);
    this.organization = organization || this;
    this.children = [];
}
Collection.prototype.addChild = function (child) {
    child.organization = this;
    this.children.push(child);
};
Collection.prototype.getChildren = function () {
    return this.children;
};
Collection.prototype.childCount = function () {
    return this.getChildren().length;
};
Collection.prototype.setPosition = function (left, top) {
    this.position.left = left;
    this.position.top = top;
};
Collection.prototype.getPosition = function () {
    return this.position
};
Collection.prototype.offset = function (left, top) {
    this.position.left += left;
    this.position.top += top;
};

function Checkerboard(width, height) {
    this.width = width;
    this.height = height;
    this.chessmen = [];
    this.chessmenForID = {};
}
Checkerboard.prototype.addChessman = function (chessman) {
    if (chessman.constructor === Chessman) {
        if (!this.isConflict(chessman) && !this.isOverflow(chessman)) {
            this.chessmen.push(chessman);
            this.chessmenForID[chessman.id] = chessman;
            return true;
        }
    } else if (chessman.constructor === Collection) {
        const children = chessman.getChildren();
        for (var i in children) {
            if (this.isConflict(children[i]) || this.isOverflow(children[i])) {
                return false;
            }
        }
        for (var i in children) {
            this.chessmen.push(children[i]);
        }
        this.chessmenForID[chessman.id] = chessman;
        return true;
    }

    return false;
};
Checkerboard.prototype.isConflict = function (chessman) {
    for (var i in this.chessmen) {
        const chess = this.chessmen[i];
        const chessPosition = chess.getPosition();
        const chessmanPosition = chessman.getPosition();
        const isLeft = chessPosition.left == chessmanPosition.left;
        const isTop = chessPosition.top == chessmanPosition.top;
        const id = chess.id != chessman.id;
        if (isLeft && isTop && id) {
            if (chess.organization === null && chessman.organization == null) {
                return true;
            }
            if (chess.organization === undefined && chessman.organization == undefined) {
                return true;
            }
            if (chess.organization != chessman.organization) {
                return true;
            }
        }
    }
    return false;
};
Checkerboard.prototype.isOverflow = function (chessman) {
    if (chessman.constructor === Chessman) {
        const position = chessman.getPosition();
        const left = position.left >= 0 && position.left < this.width;
        const top = position.top >= 0 && position.top < this.height;
        return !(left && top);
    }
    throw 'Is Collection';
};
Checkerboard.prototype.getChessman = function (id) {
    return this.chessmenForID[id];
};
Checkerboard.prototype.moveUp = function (chessman) {
    const ches = this.chessmenForID[chessman.id];
    if (ches) {
        return this.offset(chessman, 0, -1);
    }
    return false;
};
Checkerboard.prototype.moveDown = function (chessman) {
    const ches = this.chessmenForID[chessman.id];
    if (ches) {
        return this.offset(chessman, 0, 1);
    }
    return false;
};
Checkerboard.prototype.moveLeft = function (chessman) {
    const ches = this.chessmenForID[chessman.id];
    if (ches) {
        return this.offset(chessman, -1, 0);
    }
    return false;
};
Checkerboard.prototype.moveRight = function (chessman) {
    const ches = this.chessmenForID[chessman.id];
    if (ches) {
        return this.offset(chessman, 1, 0);
    }
    return false;
};
Checkerboard.prototype.offset = function (chessman, left, top) {
    if (chessman.constructor === Chessman) {
        chessman.offset(left, top);
        if (!this.isConflict(chessman) && !this.isOverflow(chessman)) {
            return true;
        } else {
            chessman.offset(-left, -top);
            return false;
        }
    } else if (chessman.constructor === Collection) {
        chessman.offset(left, top);
        const children = chessman.getChildren();
        for (var i in children) {
            if (this.isConflict(children[i]) || this.isOverflow(children[i])) {
                chessman.offset(-left, -top);
                return false;
            }
        }
        return true;
    }
    return false;
};
Checkerboard.prototype.clear = function () {
    this.chessmen = [];
    this.chessmenForID = {};
};


function buildSoldier(index) {
    var id = 'soldier' + index;
    return new Chessman(id, 0, 0);
}
function buildGeneralVertical(index) {
    var id = 'general-vertical' + index;
    const gv = new Collection(id, 0, 0);
    const gv_so0 = new Chessman(id + 0, 0, 0);
    const gv_so1 = new Chessman(id + 1, 0, 1);
    gv.addChild(gv_so0);
    gv.addChild(gv_so1);
    return gv;
}
function buildGeneralHorizontal() {
    const id = 'general-horizontal';
    const gh = new Collection(id, 0, 0);
    const gh_so0 = new Chessman(id + 0, 0, 0);
    const gh_so1 = new Chessman(id + 1, 1, 0);
    gh.addChild(gh_so0);
    gh.addChild(gh_so1);
    return gh;
}
function buildEmperor() {
    const id = 'emperor';
    const em = new Collection(id, 0, 0);
    const em_so0 = new Chessman(id + 0, 0, 0);
    const em_so1 = new Chessman(id + 1, 1, 0);
    const em_so2 = new Chessman(id + 2, 0, 1);
    const em_so3 = new Chessman(id + 3, 1, 1);
    em.addChild(em_so0);
    em.addChild(em_so1);
    em.addChild(em_so2);
    em.addChild(em_so3);
    return em;
}

const BASE_WIDTH = 100;
const Checkerboard_WIDTH = 4;
const Checkerboard_HEIGHT = 5;
const gData = {};
document.ready(function () {
    var positionList = [];
    var emperor = null;
    var generalHorizontal = null;
    var generalVerticalList = [];
    var soldierList = [];
    for (var left = 0; left < Checkerboard_WIDTH; left++) {
        for (var top = 0; top < Checkerboard_HEIGHT; top++) {
            positionList.push({left: left, top: top})
        }
    }
    const templateList = {
        0: {
            emperor: {left: 1, top: 0},
            gh: {left: 1, top: 2},
            gv: [
                {left: 0, top: 0},
                {left: 3, top: 0},
                {left: 0, top: 2},
                {left: 3, top: 2}
            ],
            so: [
                {left: 1, top: 3},
                {left: 2, top: 3},
                {left: 0, top: 4},
                {left: 3, top: 4}
            ]
        }
        , 1: {
            emperor: {left: 1, top: 0},
            gh: {left: 1, top: 2},
            gv: [
                {left: 0, top: 0},
                {left: 3, top: 0},
                {left: 0, top: 3},
                {left: 3, top: 3}],
            so: [
                {left: 1, top: 3},
                {left: 2, top: 3},
                {left: 0, top: 2},
                {left: 3, top: 2}]
        }
        , 2: {
            emperor: {left: 1, top: 0},
            gh: {left: 1, top: 3},
            gv: [
                {left: 0, top: 0},
                {left: 3, top: 0},
                {left: 0, top: 3},
                {left: 3, top: 3}],
            so: [
                {left: 1, top: 2},
                {left: 2, top: 2},
                {left: 0, top: 2},
                {left: 3, top: 2}]
        }
        , 3: {
            emperor: {left: 1, top: 0},
            gh: {left: 1, top: 2},
            gv: [
                {left: 0, top: 1},
                {left: 3, top: 1},
                {left: 0, top: 3},
                {left: 3, top: 3}
            ],
            so: [
                {left: 1, top: 3},
                {left: 2, top: 3},
                {left: 0, top: 0},
                {left: 3, top: 0}
            ]
        }
        , 4: {
            emperor: {left: 0, top: 0},
            gh: {left: 0, top: 2},
            gv: [
                {left: 2, top: 0},
                {left: 3, top: 0},
                {left: 0, top: 3},
                {left: 1, top: 3}
            ],
            so: [
                {left: 2, top: 2},
                {left: 3, top: 2},
                {left: 2, top: 3},
                {left: 3, top: 3}
            ]
        }
        , 5: {
            emperor: {left: 1, top: 0},
            gh: {left: 1, top: 4},
            gv: [
                {left: 0, top: 0},
                {left: 3, top: 0},
                {left: 1, top: 2},
                {left: 2, top: 2}
            ],
            so: [
                {left: 0, top: 3},
                {left: 3, top: 3},
                {left: 0, top: 4},
                {left: 3, top: 4}
            ]
        }
    };


    gData.currentSelect = null;
    gData.chessmen = [];
    gData.checkerboard = new Checkerboard(Checkerboard_WIDTH, Checkerboard_HEIGHT);
    gData.elementDict = {
        dict: {},
        add: function (id) {
            const el = document.getElementById(id);
            gData.elementDict.dict[id] = el;
            el.onclick = gData.elementDict.select(id, el);
        },
        get: function (id) {
            return gData.elementDict.dict[id];
        },
        select: function (id, el) {
            return function () {
                gData.currentSelect = gData.checkerboard.getChessman(id);
                //console.log(gData.currentSelect);
                gData.elementDict.updateSelect(el);
            }
        },
        updateSelect: function (el) {
            const select = 'select-el';
            var oClass = null;
            for (var i in gData.elementDict.dict) {
                const e = gData.elementDict.dict[i];
                oClass = e.getAttribute('class');
                oClass = oClass.replace(select, '');
                e.setAttribute('class', oClass)
            }
            oClass = el.getAttribute('class');
            el.setAttribute('class', oClass + ' ' + select);
        }
    };

    function addChessman(chessman) {
        gData.elementDict.add(chessman.id);
        gData.chessmen.push(chessman);
    }
    emperor = buildEmperor();
    addChessman(emperor);
    generalHorizontal = buildGeneralHorizontal();
    addChessman(generalHorizontal);
    for (var i = 0; i < 4; i++) {
        const gv = buildGeneralVertical(i);
        generalVerticalList.push(gv);
        addChessman(gv);

        const so = buildSoldier(i);
        soldierList.push(so);
        addChessman(so);
    }


    function updateUI() {
        for (var i in  gData.chessmen) {
            const chess = gData.chessmen[i];
            const el = gData.elementDict.get(chess.id);
            moveTo(chess, el);
        }
    }

    function checkWin() {
        const left = emperor.getPosition().left == 1;
        const top = emperor.getPosition().top == 3;
        const isWin = left && top;
        if (isWin) {
            const el = gData.elementDict.get(emperor.id);
            winAni(el, refresh)
        }
    }

    document.onkeydown = function (event) {
        const checkerboard = gData.checkerboard;
        const elementDict = gData.elementDict;
        var currentSelect = gData.currentSelect;
        var e = event || window.event || arguments.callee.caller.arguments[0];

        var element = null;
        if (currentSelect) {
            element = elementDict.dict[currentSelect.id];
        }

        if (e && e.keyCode == 87) { // 按 W
            if (checkerboard.moveUp(currentSelect)) {
                moveTo(currentSelect, element);
            }
        }
        if (e && e.keyCode == 83) { // 按 S
            if (checkerboard.moveDown(currentSelect)) {
                moveTo(currentSelect, element);
            }
        }
        if (e && e.keyCode == 65) { // A 键
            if (checkerboard.moveLeft(currentSelect)) {
                moveTo(currentSelect, element);
            }
        }
        if (e && e.keyCode == 68) { // D 键
            if (checkerboard.moveRight(currentSelect)) {
                moveTo(currentSelect, element);
            }
        }
        checkWin();

    };

    function refresh() {
        const checkerboard = gData.checkerboard;

        var count = 0;
        do {
            count = 0;
            checkerboard.clear();
            positionList = randomList(positionList);
            for (var i in gData.chessmen) {
                const chessman = gData.chessmen[i];

                for (var x in positionList) {
                    var top = positionList[x].top;
                    var left = positionList[x].left;
                    chessman.setPosition(left, top);

                    if (checkerboard.addChessman(chessman)) {
                        count++;
                        break;
                    }
                }
            }
        } while (count < gData.chessmen.length);

        updateUI();
    }
    document.getElementById('refresh').onclick = refresh;

    function showTemplate(template) {
        const checkerboard = gData.checkerboard;
        checkerboard.clear();

        emperor.setPosition(template.emperor.left, template.emperor.top);
        checkerboard.addChessman(emperor);

        generalHorizontal.setPosition(template.gh.left, template.gh.top);
        checkerboard.addChessman(generalHorizontal);

        for (var i = 0; i < 4; i++) {
            const gv = generalVerticalList[i];
            const so = soldierList[i];

            gv.setPosition(template.gv[i].left, template.gv[i].top);
            so.setPosition(template.so[i].left, template.so[i].top);

            checkerboard.addChessman(gv);
            checkerboard.addChessman(so);
        }
        updateUI();
    }
    const templateEl = document.getElementsByClassName('template');
    for (var i = 0; i < templateEl.length; i++) {
        const el = templateEl[i];
        el.onclick = function () {
            const index = el.getAttribute('index');
            const temp = templateList[index];
            showTemplate(temp);
        };
    }

    refresh();
});

function winAni(el, callback) {
    Velocity(el, {
        opacity: 0
    }, {
        // 动画循环执行3次
        loop: 3,
        // 回调函数将在第3次循环结束后 执行一次
        complete: function (elements) {
            // alert("I am hungry！");
            if (callback) {
                callback();
            }
        }
    });
}

function moveTo(chessman, el) {
    var position = {left: BASE_WIDTH, top: BASE_WIDTH};
    position.left *= chessman.getPosition().left;
    position.top *= chessman.getPosition().top;
    moveAni(el.parentNode, position);
}
function moveAni(el, position, callback) {
    Velocity(el, position, {easing: "easeInSine", complete: callback});
}

function random(max) {
    return parseInt(Math.random() * max);
}
function randomList(list) {
    var result = new Array(list.length);
    var index = 0;
    for (var i in list) {
        const item = list[i];
        do {
            index = random(list.length);
        } while (result[index]);
        result[index] = item;
    }
    return result;
}


