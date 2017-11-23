/**
 * Auther: MaiJZ
 * Date: 2017/4/23
 * Github: https://github.com/maijz128
 */

function BFS_State() {
}
BFS_State.prototype.isTargetStatus = function () {

};
BFS_State.prototype.equal = function (state) {

};

function BFS_StateTransition() {
    var self = this;
    self.transition = [];
}
BFS_StateTransition.prototype.list = function () {
    return this.transition;
};
BFS_StateTransition.prototype.len = function () {
    return this.transition.length;
};
BFS_StateTransition.prototype.add = function (transform) {
    this.transition.push(transform);
};
BFS_StateTransition.prototype.copy = function () {
    var result = new BFS_StateTransition();
    result.transition = this.transition.slice();
    return result;
};
BFS_StateTransition.prototype.equal = function (stateTransition) {
    const tTransition = stateTransition.list();
    const sTransition = this.transition;

    for (var i in sTransition) {
        const sTransform = sTransition[i];
        const tTransform = tTransition[i];
        var notEqual = false;
        if (sTransform.hasOwnProperty('equal')) {
            notEqual = !sTransform.equal(tTransform);
        } else {
            notEqual = !(sTransform == tTransform);
        }
        if (notEqual) {
            return false;
        }
    }
    return true;
};

function BFS_StateMachine() {
}
// 状态转移列表
BFS_StateMachine.prototype.stateTransition = function (state) {
    var result = new StateTransition();

    return result;
};
// 转移状态
BFS_StateMachine.prototype.nextState = function (state, transform) {

};

function BreadthFirstSearch(stateMachine) {
    var self = this;
    self.MaxDepth = 500;
    self.stateMachine = stateMachine;

    self._isVisited = function (visited, state) {
        for (var i in visited) {
            if (state.equal(visited[i])) {
                return true;
            }
        }
        return false;
    };
    self._addTarget = function (result, state, stateTransition) {
        var notHas = true;
        for (var i in result) {
            const item = result[i];
            const cont1 = state.equal(item.state);
            const cont2 = stateTransition.equal(item.transition);
            if (cont1 && cont2) {
                notHas = false;
                break;
            }
        }
        if (notHas) {
            result.push({
                state: state,
                transition: stateTransition
            });
        }
        return result;
    };

    self.find = function (stateRoot, emptyStateTransition, isOnce) {
        var result = [];
        var visited = [];
        var unvisited = [];
        var depth = 0;

        emptyStateTransition = emptyStateTransition || new BFS_StateTransition();
        var current = {
            depth: 0,
            state: stateRoot,
            transition: emptyStateTransition
        };
        unvisited.push(current);

        while (self.MaxDepth > depth && unvisited.length > 0) {
            current = unvisited.shift();
            visited.push(current.state);

            if (current.state.isTargetStatus()) {
                self._addTarget(result, current.state, current.transition);
                if (isOnce) {
                    return result;
                }
            }

            const stateTransition = self.stateMachine.stateTransition(current.state);
            const stateTransitionList = stateTransition.list();
            for (var i in stateTransitionList) {
                const transform = stateTransitionList[i];
                const nextState = self.stateMachine.nextState(current.state, transform);

                const notVisited = !self._isVisited(visited, nextState);
                if (notVisited) {
                    const transition = current.transition.copy();
                    transition.add(transform);
                    unvisited.push({
                        depth: current.depth + 1,
                        state: nextState,
                        transition: transition
                    });
                }
            }

            depth = current.depth;
        }

        return result;
    };
}
