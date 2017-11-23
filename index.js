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
Collection.prototype.setPosition = function (left, top) {
    this.position.left = left;
    this.position.top = top;
};
Collection.prototype.getPosition = function () {
    var position = {left: 0, top: 0};
    position.left = this.position.left;
    position.top = this.position.top;
    return position
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
    this.offsetList = {};
    this.offsetList[MOVE.DOWN] = {left: 0, top: 1};
    this.offsetList[MOVE.UP] = {left: 0, top: -1};
    this.offsetList[MOVE.LEFT] = {left: -1, top: 0};
    this.offsetList[MOVE.RIGHT] = {left: 1, top: 0};

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
Checkerboard.prototype.move = function (chessman, move) {
    const ches = this.chessmenForID[chessman.id];
    if (ches) {
        const offset = this.offsetList[move];
        if (offset) {
            return this.offset(chessman, offset.left, offset.top);
        }
    }
    return false;
};
Checkerboard.prototype.canMoveList = function (chessman) {
    const result = [];
    const ches = this.chessmenForID[chessman.id];
    if (ches) {
        for (var name in MOVE) {
            const move = MOVE[name];
            const offset = this.offsetList[move];
            if (this.canOffset(chessman, offset.left, offset.top)) {
                result.push(move);
            }
        }
    }
    return result;
};
Checkerboard.prototype.canOffset = function (chessman, left, top) {
    if (chessman.constructor === Chessman) {
        chessman.offset(left, top);
        const result = (!this.isConflict(chessman) && !this.isOverflow(chessman));
        chessman.offset(-left, -top);
        return result;
    } else if (chessman.constructor === Collection) {
        chessman.offset(left, top);
        const children = chessman.getChildren();
        for (var i in children) {
            if (this.isConflict(children[i]) || this.isOverflow(children[i])) {
                chessman.offset(-left, -top);
                return false;
            }
        }
        chessman.offset(-left, -top);
        return true;
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
function Chessmen(checkerboard) {
    var self = {};
    self.checkerboard = checkerboard;
    self._positionList = [];
    self._chessmen = [];
    self._chessmenForID = {};
    self.isNotifyUpdate = true;
    self._onUpdate = [];
    self.emperor = null;
    self.generalHorizontal = null;
    self.generalVerticalList = [];
    self.soldierList = [];

    self.list = function () {
        return self._chessmen;
    };
    self.get = function (id) {
        return self._chessmenForID[id];
    };
    self.move = function (id, move) {
        const chess = self.get(id);
        const result = self.checkerboard.move(chess, move);
        if (result) {
            self._notifyUpdate();
        }
        return result;
    };
    self.refreshPosition = function () {
        const checkerboard = self.checkerboard;
        const chessmen = self.list();
        var count = 0;
        do {
            count = 0;
            checkerboard.clear();
            self._positionList = randomList(self._positionList);
            for (var i in chessmen) {
                const chessman = chessmen[i];

                for (var x in  self._positionList) {
                    var top = self._positionList[x].top;
                    var left = self._positionList[x].left;
                    chessman.setPosition(left, top);

                    if (checkerboard.addChessman(chessman)) {
                        count++;
                        break;
                    }
                }
            }
        } while (count < chessmen.length);
        self._notifyUpdate();
    };
    self._showTemplate = function (template) {
        const checkerboard = self.checkerboard;
        checkerboard.clear();

        self.emperor.setPosition(template.emperor.left, template.emperor.top);
        checkerboard.addChessman(self.emperor);

        self.generalHorizontal.setPosition(template.gh.left, template.gh.top);
        checkerboard.addChessman(self.generalHorizontal);

        for (var i = 0; i < 4; i++) {
            const gv = self.generalVerticalList[i];
            const so = self.soldierList[i];

            gv.setPosition(template.gv[i].left, template.gv[i].top);
            so.setPosition(template.so[i].left, template.so[i].top);

            checkerboard.addChessman(gv);
            checkerboard.addChessman(so);
        }

        self._notifyUpdate();
    };
    self.showTemplate = function (index) {
        const temp = TemplateList[index];
        self._showTemplate(temp);
    };
    self.isWin = function () {
        const left = self.emperor.getPosition().left == 1;
        const top = self.emperor.getPosition().top == 3;
        return left && top;
    };
    self.toJson = function () {
        var json = {};
        for (var index in self._chessmen) {
            const chess = self._chessmen[index];
            json[chess.id] = chess.getPosition();
        }
        return json;
    };
    self.parse = function (json) {
        if (json) {
            var gv = [];
            var so = [];
            for (var i = 0; i < 4; i++) {
                const gvID = self.generalVerticalList[i].id;
                const soID = self.soldierList[i].id;
                gv.push(json[gvID]);
                so.push(json[soID]);
            }
            const template = {
                emperor: json[self.emperor.id],
                gh: json[self.generalHorizontal.id],
                gv: gv,
                so: so
            };
            self._showTemplate(template);
        }
    };
    self._notifyUpdate = function () {
        if (this.isNotifyUpdate) {
            for (var i in self._onUpdate) {
                self._onUpdate[i]();
            }
        }
    };
    self.onUpdate = function (func) {
        self._onUpdate.push(func);
    };
    self.canMoveList = function () {
        var result = [];
        for (var i in self._chessmen) {
            const chess = self._chessmen[i];
            const list = self.checkerboard.canMoveList(chess);
            for (var ii in list) {
                result.push({
                    id: chess.id,
                    move: list[ii]
                });
            }
        }
        return result;
    };

    //  init
    {
        for (var left = 0; left < Checkerboard_WIDTH; left++) {
            for (var top = 0; top < Checkerboard_HEIGHT; top++) {
                self._positionList.push({left: left, top: top})
            }
        }

        function addChessman(chessman) {
            self._chessmen.push(chessman);
            self._chessmenForID[chessman.id] = chessman;
        }

        self.emperor = buildEmperor();
        addChessman(self.emperor);
        self.generalHorizontal = buildGeneralHorizontal();
        addChessman(self.generalHorizontal);

        for (var i = 0; i < 4; i++) {
            const gv = buildGeneralVertical(i);
            self.generalVerticalList.push(gv);
            addChessman(gv);

            const so = buildSoldier(i);
            self.soldierList.push(so);
            addChessman(so);
        }
    }

    return self;
}

function Save(chessmen) {
    var self = this;
    self._queue = [];
    self._index = -1;
    self.json = null;
    if (chessmen) {
        self.json = chessmen.toJson();
    }

    self.queue = function (queue) {
        if (queue) {
            self._queue = queue.slice();
        }
        return self._queue;
    };
    self.queueLen = function () {
        return self._queue.length;
    };
    self.add = function (id, move) {
        self._queue.push({
            id: id,
            move: move
        });
    };
    self.clear = function () {
        self._queue = [];
        self.reset();
    };
    self.next = function () {
        if (self._queue.length > 0) {
            self._index++;
            return self._queue[self._index];
        }
        return null;
    };
    self.reset = function () {
        self._index = -1;
    };
    self.copy = function () {
        var save = new Save();
        save._queue = self._queue.slice();
        save._index = self._index;
        save.json = self.json;
        return save;
    };
    self.equalJson = function (json) {
        if (self.json) {
            for (var key in self.json) {
                const aP = self.json[key];
                const bP = json[key];
                if (bP) {
                    if (bP.left != aP.left || bP.top != aP.top) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        } else {
            return self.json === json;
        }
    };
    self.equalQueue = function (queue) {
        for (var i in self._queue) {
            const sItem = self._queue[i];
            const item = queue[i];
            if (item) {
                if (item.id != sItem.id || item.move != sItem.move) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    };

}


function Recorder(chessmen) {
    var self = {};
    self.chessmen = chessmen;
    self.save = null;
    self.isRecording = false;
    self.interval = 500;
    self.player = -1;
    self._onReplayUpdate = [];
    self.record = function () {
        self.save = new Save(self.chessmen);
        self.isRecording = true;
        self.stopReplay();
    };
    self.stopRecord = function () {
        self.isRecording = false;
    };
    self.stopReplay = function () {
        if (self.player > -1) {
            clearInterval(self.player);
        }
    };
    self.replay = function () {
        const recorder = self;
        recorder.stopRecord();
        recorder.stopReplay();
        self.chessmen.parse(recorder.save.json);
        recorder.save.reset();

        recorder.player = setInterval(function () {
            const next = recorder.save.next();
            if (next) {
                self.chessmen.move(next.id, next.move)
            } else {
                recorder.stopReplay();
            }
        }, recorder.interval);
    };
    self.add = function (id, move) {
        if (self.isRecording && self.save) {
            self.save.add(id, move);
        }
    };
    return self;
}

function BFS(chessmen) {
    var self = {};
    self.MaxDepth = 200;
    self.chessmen = chessmen;

    function ChessmenState() {
        this.json = {};
    }

    ChessmenState.prototype = new BFS_State();
    ChessmenState.prototype.constructor = ChessmenState;
    ChessmenState.prototype.isTargetStatus = function () {
        const emperor = this.json['emperor'];
        const left = emperor.left == 1;
        const top = emperor.top == 3;
        return left && top;
    };
    ChessmenState.prototype.equal = function (state) {
        if (state) {
            for (var i in this.json) {
                const sChessman = this.json[i];
                const tChessman = state.json[i];
                const equalLeft = (sChessman.left == tChessman.left);
                const equalTop = (sChessman.top == tChessman.top);
                if (!equalLeft || !equalTop) {
                    return false;
                }
            }
        }
        return true;
    };

    function ChessmanTransform(id, move) {
        this.id = id;
        this.move = move;
    }

    ChessmanTransform.MOVE = {
        UP: 87,
        DOWN: 83,
        LEFT: 65,
        RIGHT: 68
    };
    ChessmanTransform.prototype.equal = function (transform) {
        if (transform) {
            const equalID = this.id == transform.id;
            const equalMove = this.move == transform.move;
            return equalID && equalMove;
        }
        return false;
    };

    function ChessmenStateMachine(chessmen) {
        this.checkerboard = new Checkerboard(Checkerboard_WIDTH, Checkerboard_HEIGHT);
        this.chessmen = new Chessmen(this.checkerboard);
        this.chessmen.parse(chessmen.toJson());
    }

    ChessmenStateMachine.prototype = new BFS_StateMachine();
    ChessmenStateMachine.prototype.constructor = ChessmenStateMachine;
    ChessmenStateMachine.prototype.stateTransition = function (state) {
        var result = new BFS_StateTransition();
        this.chessmen.parse(state.json);
        const list = this.chessmen.canMoveList();
        for (var i in list) {
            const item = list[i];
            const cTr = new ChessmanTransform(item.id, item.move);
            result.add(cTr);
        }
        return result;
    };
    ChessmenStateMachine.prototype.nextState = function (state, transform) {
        var result = new ChessmenState();
        this.chessmen.parse(state.json);
        this.chessmen.move(transform.id, transform.move);
        result.json = this.chessmen.toJson();
        return result
    };


    self.getSave = function () {
        var result = new Save(self.chessmen);

        const csm = new ChessmenStateMachine(self.chessmen);
        const bfs = new BreadthFirstSearch(csm);
        bfs.MaxDepth = self.MaxDepth;

        const rootState = new ChessmenState();
        rootState.json = self.chessmen.toJson();

        var list = bfs.find(rootState, null, true);
        for (var i in list) {
            const item = list[i];
            const transition = item.transition;
            if (result.queueLen() == 0) {
                result.queue(transition.list());
            } else if (result.queueLen() > transition.len()) {
                result.queue(transition.list());
            }
        }

        return result;
    };
    return self;
}

const BASE_WIDTH = 100;
const Checkerboard_WIDTH = 4;
const Checkerboard_HEIGHT = 5;
const TemplateList = {
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
const MOVE = {
    UP: 87,
    DOWN: 83,
    LEFT: 65,
    RIGHT: 68
};

const g = {};
document.ready(function () {
    g.checkerboard = new Checkerboard(Checkerboard_WIDTH, Checkerboard_HEIGHT);
    g.chessmen = Chessmen(g.checkerboard);
    g.recorder = Recorder(g.chessmen);
    g.BFS = BFS(g.chessmen);
    g.ui = UI(g.chessmen, g.recorder, g.BFS);

    g.chessmen.showTemplate(2);
    const temp = {
        emperor: {left: 2, top: 3},
        gh: {left: 1, top: 0},
        gv: [
            {left: 0, top: 0},
            {left: 3, top: 0},
            {left: 0, top: 2},
            {left: 1, top: 3}],
        so: [
            {left: 1, top: 2},
            {left: 2, top: 1},
            {left: 1, top: 1},
            {left: 2, top: 2}]
    };
    g.chessmen._showTemplate(temp);
});

function UI(chessmen, recorder, BFS) {
    var self = {};
    self.chessmen = chessmen;
    self.elementDict = {
        dict: {},
        add: function (id) {
            const el = document.getElementById(id);
            self.elementDict.dict[id] = el;
            el.onclick = self.elementDict.select(id, el);
        },
        get: function (id) {
            return self.elementDict.dict[id];
        },
        select: function (id, el) {
            return function () {
                self.currentSelect = self.chessmen.get(id);
                self.elementDict.updateSelect(el);
            }
        },
        updateSelect: function (el) {
            const select = 'select-el';
            var oClass = null;
            for (var i in self.elementDict.dict) {
                const e = self.elementDict.dict[i];
                oClass = e.getAttribute('class');
                oClass = oClass.replace(select, '');
                e.setAttribute('class', oClass)
            }
            oClass = el.getAttribute('class');
            el.setAttribute('class', oClass + ' ' + select);
        }
    };
    self.currentSelect = null;
    self.canOnKeyDown = true;
    self.recorder = recorder;
    self.BFS = BFS;

    self.updateUI = function () {
        const chessmen = self.chessmen.list();
        for (var i in  chessmen) {
            const chess = chessmen[i];
            const el = self.elementDict.get(chess.id);
            moveTo(chess, el);
        }
    };
    self.refresh = function () {
        self.chessmen.refreshPosition();
    };

    self.checkWin = function () {
        if (self.chessmen.isWin()) {
            const emperor = self.chessmen.emperor;
            const el = self.elementDict.get(emperor.id);
            winAni(el, self.refresh)
        }
    };

    self.changeSelect = function (id) {
        self.currentSelect = self.chessmen.get(id);
        const el = self.elementDict.dict[id];
        self.elementDict.updateSelect(el);
    };
    self.move = function (move) {
        if (self.canOnKeyDown) {
            const chessmen = self.chessmen;
            const currentSelect = self.currentSelect;

            const isMove = chessmen.move(currentSelect.id, move);

            if (isMove) {
                self.recorder.add(currentSelect.id, move);
            }
        }
    };
    self.auto = function () {
        const save = self.BFS.getSave();
        if (save) {
            self.recorder.save = save;
            self.recorder.replay();
        }
    };

    {
        self.chessmen.onUpdate(function () {
            self.updateUI();
            self.checkWin();
        });

        const chessmen = self.chessmen.list();
        for (var i in chessmen) {
            self.elementDict.add(chessmen[i].id);
        }

        document.onkeydown = function (event) {
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if (e) {
                self.move(e.keyCode);
            }
        };

        const templateEl = document.getElementsByClassName('template');
        for (var i = 0; i < templateEl.length; i++) {
            const el = templateEl[i];
            el.onclick = function () {
                const index = el.getAttribute('index');
                self.chessmen.showTemplate(index);
                self.updateUI();
            };
        }

        document.getElementById('refresh').onclick = self.refresh;
        document.getElementById('record').onclick = self.recorder.record;
        document.getElementById('record-stop').onclick = self.recorder.stopRecord;
        document.getElementById('replay').onclick = self.recorder.replay;
        document.getElementById('replay-stop').onclick = self.recorder.stopReplay;
        document.getElementById('auto').onclick = self.auto;

        self.refresh();
    }
    return self;
}

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


