/**
 * Auther: MaiJZ
 * Date: 2017/4/23
 * Github: https://github.com/maijz128
 */


function testBFS() {
    const Barrier = 9;
    const Target = 2;
    const map = [
        [1, 0, 0, 0, 0],
        [9, 9, 0, 0, 0],
        [9, 0, 0, 9, 0],
        [9, 0, 9, 9, 0],
        [9, 0, 0, 2, 0]];

    const width = 5;
    const height = 5;

    const personA = {'x': 0, 'y': 0};
    const personB = {'x': 3, 'y': 4};

    function hasBarrier(state) {
        const x = state.position.x;
        const y = state.position.y;
        return (map[y][x] == Barrier)
    }

    const Transform = {
        UP: 'UP',
        DOWN: 'DOWN',
        LEFT: 'LEFT',
        RIGHT: 'RIGHT'
    };

    function MyState() {
        var self = this;
        self.position = {x: 0, y: 0};
    }

    MyState.prototype = new BFS_State();
    MyState.prototype.constructor = MyState;
    MyState.prototype.isTargetStatus = function () {
        const x = this.position.x;
        const y = this.position.y;
        return map[y][x] == Target
    };
    MyState.prototype.equal = function (state) {
        if (state) {
            const equalX = (this.position.x == state.position.x);
            const equalY = (this.position.y == state.position.y);
            return (equalX && equalY)
        }
        return false;
    };

    function MyStateMachine() {
    }

    MyStateMachine.prototype = new BFS_StateMachine();
    MyStateMachine.prototype.constructor = MyStateMachine;
    // 状态转移列表
    MyStateMachine.prototype.stateTransition = function (state) {
        var self = this;
        var result = new BFS_StateTransition();
        const x = state.position.x;
        const y = state.position.y;

        function _add(transform) {
            const nextState = self.nextState(state, transform);
            if (!hasBarrier(nextState)) {
                result.add(transform);
            }
        }

        if (x > 0) {
            _add(Transform.LEFT);
        }
        if (x < (width - 1)) {
            _add(Transform.RIGHT)
        }
        if (y > 0) {
            _add(Transform.UP)
        }
        if (y < (height - 1)) {
            _add(Transform.DOWN)
        }
        return result;
    };
    // 转移状态
    MyStateMachine.prototype.nextState = function (state, transform) {
        var result = new MyState();
        result.position.x = state.position.x;
        result.position.y = state.position.y;

        switch (transform) {
            case Transform.UP:
                result.position.y -= 1;
                break;
            case Transform.DOWN:
                result.position.y += 1;
                break;
            case Transform.LEFT:
                result.position.x -= 1;
                break;
            case Transform.RIGHT:
                result.position.x += 1;
                break;
        }
        return result
    };

    console.assert(hasBarrier({position: {x: 0, y: 1}}));

    const bfs = new BreadthFirstSearch(new MyStateMachine());
    const stateRoot = new MyState();
    stateRoot.position.x = personA.x;
    stateRoot.position.y = personA.y;
    const result = bfs.find(stateRoot, new BFS_StateTransition());
    console.log(result);
}