//  [
//    [*,0,0],
//    [1,0,0],
//    [1,1,0]
//  ]; 
//       * - is coordinate of the figure
//       0 - means that field is empty
//       >0 - means occupied field

//      *---------> x
//      |
//      |
//      |
//    y V


//////////////////////////////////////////////////////////////////////
var Tetris;
var Styles = ["square back","square c","square d","square e","square f","square g","square h"];
var BodyStyles = ['m','n','v','x'];
var Css = { 'table#tblField' : 'border-top-width: 1px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 1px; border-color: black; border-style: solid;' };
//////////////////////////////////////////////////////////////////////
// TODO: hide into Game class
var L0 = [
    [1,0,0],
    [1,0,0],
    [1,1,0]];
var L1 = [
    [1,1,1],
    [1,0,0],
    [0,0,0]];
var L2 = [
    [0,1,1],
    [0,0,1],
    [0,0,1]];
var L3 = [
    [0,0,0],
    [0,0,1],
    [1,1,1]];
var T0 = [
    [1,0,0],
    [1,1,0],
    [1,0,0]];
var T1 = [
    [1,1,1],
    [0,1,0],
    [0,0,0]];
var T2 = [
    [0,0,1],
    [0,1,1],
    [0,0,1]];
var T3 = [
    [0,0,0],
    [0,1,0],
    [1,1,1]];
var I0 = [
    [1],
    [1],
    [1],
    [1]];
var I1 = [[1,1,1,1]];
var S0 = [
    [1,0],
    [1,1],
    [0,1]];
var S1 = [
    [0,1,1],
    [1,1,0]];
var Z0 = [
    [0,1],
    [1,1],
    [1,0]];
var Z1 = [
    [1,1,0],
    [0,1,1]];
var Q0 = [
    [1,1],
    [1,1]];
var L = [L0,L1,L2,L3];
var T = [T0,T1,T2,T3];
var I = [I0,I1,I0,I1];
var S = [S0,S1,S0,S1];
var Q = [Q0,Q0,Q0,Q0];
var Z = [Z0,Z1,Z0,Z1];

P = [L,T,I,S,Q,Z];

//////////////////////////////////////////////////////////////////////
////////  some helper functions  /////////////////////////////////////
//////////////////////////////////////////////////////////////////////
function getPageSize() {
    var myWidth = 0, myHeight = 0;
    if (typeof (window.innerWidth) == 'number') {
        myWidth = window.innerWidth; 
        myHeight = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        myWidth = document.documentElement.clientWidth; 
        myHeight = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
       myWidth = document.body.clientWidth; 
       myHeight = document.body.clientHeight;
    }
    return [myWidth, myHeight];
}
function setStyle(selector, property, value) {
    var cssRuleCode = document.all ? 'rules' : 'cssRules'; //account for IE and FF
    //TODO: iterate through sheets
    var rules = document.styleSheets[0][cssRuleCode];
    for (var i=0; i<rules.length; i++) {
        if (selector ==  rules[i].selectorText) {
                rules[i].style[property] = value;
        }        
    }
}
//////////////////////////////////////////////////////////////////////
//////// UI class  ///////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

function TetrisCssUI(html_root_element) {

    h = getPageSize()[1];
    ch = Math.floor((h-70)/21);
    setStyle('div.square', 'width', ch + 'px');
    setStyle('div.square', 'height', ch + 'px');
    document.styleSheets[0].insertRule('table#tblField{' + Css['table#tblField'] + '}', 0);

    var root = document.getElementById(html_root_element);
    var main_table = document.createElement('table');
    var tr = document.createElement('tr');
    var td_left = document.createElement('td');
    var td_right = document.createElement('td');
    var tblField = document.createElement('table');
    tblField.setAttribute('cellpadding', '0');
    tblField.setAttribute('cellspacing', '0');
    tblField.setAttribute('id', 'tblField');
    var tblBoard = document.createElement('table');
    tblBoard.setAttribute('cellpadding', '0');
    tblBoard.setAttribute('cellspacing', '0');
    tblBoard.setAttribute('id', 'tblBoard');
    
    td_left.appendChild(tblField);
    td_right.appendChild(tblBoard);
    tr.appendChild(td_right);
    tr.appendChild(td_left);
    main_table.appendChild(tr);
    root.appendChild(main_table);

    this.field_rows = [];
    this.board_rows = [];
    var levelsTable;
    document.getElementById("message").style.display = 'none';

    this.create_field = function(M, F) {
        var l = tblField;
        while (l.firstChild)  l.removeChild(l.firstChild);
        for(var row=0; row<M.length-1; row++) {
            var r = document.createElement("tr");
            for (var cell=0; cell<M[0].length-1; cell++) {
                var td = document.createElement("td");
                var d = document.createElement("div");
                d.setAttribute("class", Styles[M[row][cell]]);
                td.appendChild(d);
                r.appendChild(td);
            }
            l.appendChild(r);
        }
        this.field_rows = l.getElementsByTagName("tr");
    };

    this.create_board = function(score) {
        var l = tblBoard;
        while (l.firstChild)  l.removeChild(l.firstChild);
        for(var row=0; row<4; row++) {
            var r = document.createElement("tr");
            //TODO change 4 to max figure size
            for (var cell=0; cell<4; cell++) {
                var td = document.createElement("td");
                var d = document.createElement("div");
                d.setAttribute("class", 'square-next');
                td.appendChild(d);
                r.appendChild(td);
            }
            l.appendChild(r);
        }
        // TODO create score table by args
        this.board_rows = l.getElementsByTagName("tr");
    };

    this.draw_figure = function (M, F) {
        for (var r=0; r<F.get_height(); r++) {
            for (var c=0; c<F.get_width(); c++) {
                if (0==F.get_cell(r,c))
                    continue;
                var fc = this.field_rows[F.row+r].cells[F.cell+c];
                var fd = fc.getElementsByTagName("div");
                fd[0].setAttribute("class",Styles[F.color*F.get_cell(r,c)]);
            }
        }
    }

    this.update_score = function(score) {
    }

    this.draw_next_figure = function(fig_id) {
        var f = P[fig_id][0];
        for(var row=0; row<4; row++) {
            for (var cell=0; cell<4; cell++) {
                var c = this.board_rows[row].cells[cell];
                var d = c.getElementsByTagName("div");
                style = ((row<f.length) && (cell<f[row].length)) ? f[row][cell] : 0; 
                d[0].setAttribute("class", style ? "square-next fore" : "square-next back");
            }
        }
    }

    this.change_page_style = function() {
        //TODO: 
        document.getElementsByTagName('body')[0].setAttribute('class', 
            BodyStyles[Math.floor(Math.random()*BodyStyles.length)]);
    }

    this.redraw = function(M, F, score, next) {
        for(var row=0; row<M.length-1; row++) {
            for (var cell=0; cell<M[0].length-1; cell++) {
                var c = this.field_rows[row].cells[cell];
                var d = c.getElementsByTagName("div");
                d[0].setAttribute("class",Styles[M[row][cell]]);
            }
        }
        this.draw_figure(M, F);
        this.update_score(score);
        this.draw_next_figure(next);
    };

    this.game_over = function() {
        document.getElementById("messagetext").innerHTML = 'GAME OVER!';
        document.getElementById("message").style.display = 'block';
    }

    this.victory = function() {
        document.getElementById("messagetext").innerHTML = 'YOU WIN!';
        document.getElementById("message").style.display = 'block';
    }

}

//////////////////////////////////////////////////////////////////////
////////  Figure class  //////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
function Figure (game_, id) {

    var game = game_;

    this.m = P[id || 0];
    this.orientation = 0;
    //TODO  Styles
    this.color = Math.floor(Math.random()*Styles.length) || 1;
    this.row = 0;
    // initial x-position : center
    this.cell = Math.floor(game.field[0].length/2);

    this.move_down = function () {
        if(game.check_move(this, 0, 1, 0)) {
            this.row++;
        }
    }

    this.move_left = function () {
        if(game.check_move(this, -1, 0, 0))
            this.cell--;
    }

    this.move_right = function () {
        if(game.check_move(this, 1, 0, 0))
            this.cell++;
    }

    this.rotate_cw = function () {
        if(game.check_move(this, 0, 0, 1)) {
            this.orientation = (this.orientation+1)%4;;
        }
    }

    // TODO: down arrow to rotate ccw
    //this.rotate_ccw = function () {this.orientation--;}
    this.get_cell = function(r,c) {
        return this.m[this.orientation][r][c];
    }

    this.get_figure_by_orientation = function(o) {
        return this.m[o];
    }

    this.get_width = function () {
        return this.m[this.orientation][0].length;
    }

    this.get_height = function () {
        return this.m[this.orientation].length;
    }

};

//////////////////////////////////////////////////////////////////////
////////  Game class  ////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
function TetrisGame(html_root_element, w, h, ui) {

    function get_bonus_points(lines) {
        switch (lines) {
            case 0: return 0;
            case 1: return 1;
            case 2: return 5;
            case 3: return 10;
            case 4: return 25;
            default: return 0;
        }
    }
    this.levels = [1, 2, 6, 10, 15, 25, 50, 100, 200];
    //this.levels = [1, 2, 3];
    this.timer = null;
    this.timeout = 1200;
    this.running = false;
    this.score = {'Lines':0,'Pieces':0,'Points':0,'Level':0,'Next':this.levels.shift()};
    this.width = w || 10;
    this.height = h || 20;
    this.next_figure_id = Math.floor(Math.random()*P.length);

    /***  timer ***/
    // TODO: timeout function = member, so Global name of instance used ('Tetris')
    this.run = function() {
        if (this.running) {
            this.timer = setTimeout(function() { Tetris.run() }, this.timeout);
            this.figure.move_down();
            this.redraw_ui();
        }
    }

    this.pause = function() {
        this.running = false;
        clearTimeout(this.timer);
    }

    this.resume = function() {
        this.running = true;
        this.timer = setTimeout(function() { Tetris.run() }, this.timeout);
        this.figure.move_down();
        this.redraw_ui();
    }
    /*************/

    this.get_intersection = function(F, dX, dY, dO) {
        var fig = F.get_figure_by_orientation((F.orientation+dO)%4);
        var y = F.row + dY;
        var x = F.cell + dX;
        for (var r=0; r<fig.length; r++) {
            for (var c=0; c<fig[0].length; c++) {
                if (this.field[y+r][x+c] && fig[r][c])
                    return true;
            }
        }
        return false;
    }

    this.shift_lines = function(line) {
        for (var r=line; r>1; r--) {
            for (var c=0; c<this.field[0].length; c++) {
                this.field[r][c] = this.field[r-1][c];
            }
        }
    }

    this.check_full_lines = function() {
        var LinesToKill = [];
        var linesDone = 0;
        for (var r=this.field.length-2; r>=0; r--) {
            if (this.is_full(r)) {
                linesDone++;
                LinesToKill.push(r);
            }
        }
        this.score['Lines'] += linesDone;
        this.score['Points'] += get_bonus_points(linesDone);
        var l;
        while (l=LinesToKill.pop()) {
            this.shift_lines(l);
        }
        // New level calculations:
        l = 0;
        while(this.score['Points'] >= this.score['Next']) {
            if (0 >= this.levels.length) {
                this.pause();
                this.UI.victory();
                return;
            }
            this.score['Next'] = this.levels.shift();
		    this.score['Level']++;
            this.timeout *= 0.85;
            l = 1;
        }
        if (l>0) {
            this.UI.change_page_style();
        }
    }

    this.is_full = function(line) {
        for (var i=0; i<this.field[0].length-1; i++) {
            if (!this.field[line][i])
                return false;
        }
        return true;
    }
    this.check_landing = function() {
        if (this.get_intersection(this.figure, 0, 1, 0)) {
            this.stick_figure();
            this.check_full_lines();
        }
    }

    this.stick_figure = function() {
        for (var r=0; r<this.figure.get_height(); r++) {
            for (var c=0; c<this.figure.get_width(); c++) {
                if (0==this.figure.get_cell(r,c))
                    continue;
                this.field[this.figure.row+r][this.figure.cell+c] = this.figure.color*this.figure.get_cell(r,c);
            }
        }
        this.score['Pieces']++;
        this.figure = new Figure(this, this.next_figure_id);
        // Check if game is over:
        if (this.get_intersection(this.figure, 0, 0, 0)) {
            this.pause();
            this.UI.game_over();
            return;
        }
        this.next_figure_id = Math.floor(Math.random()*P.length);
    }

    this.check_move = function(fig, dX, dY, dO) {
        this.check_landing();
        return ! this.get_intersection(fig, dX, dY, dO);
    };
    this.field = function(w,h) {
        var M = new Array();
        //TODO: -1 index invalid!!
        for (var r=0; r<=h; r++) {
            M[r] = new Array();
            for (var c=-1; c<=w; c++) M[r][c] = 0;
        }
        for (var r=0; r<=h; r++) {
            M[r][-1] = 1;
            M[r][w] = 1;
        }
        for (var c=0; c<w; c++) M[h][c] = 1;
        return M;
    }(this.width, this.height);
    this.redraw_ui = function() { this.UI.redraw(this.field, this.figure, this.score, this.next_figure_id); };
    this.user_action = function(key) {
        if ((!this.running) && (key!=13))
            return;
        switch (key) {
            case 13: /* enter */
                this.resume(); break;
            case 27: /* esc */
                this.pause(); break;
            case 37: /* left */
                this.figure.move_left();
                this.redraw_ui(); break;
            case 39: /* right */
                this.figure.move_right();
                this.redraw_ui(); break;
            case 32: /* space */
            case 40: /* down */
                this.figure.move_down();
                this.redraw_ui(); break;
            case 38: /* up */
                this.figure.rotate_cw();
                this.redraw_ui(); break;
            default: break;
        }
    };
    this.UI = new ui(html_root_element);
    this.figure = new Figure(this, 0);
    this.UI.create_field(this.field, this.figure);
    this.UI.create_board(this.score);
    this.UI.update_score(this.score);
    this.UI.draw_figure(this.field, this.figure);
}
//////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////
////////  callbacks form html page   /////////////////////////////////
//////////////////////////////////////////////////////////////////////
//TODO: hide PrevEvent
var PrevEvent = "";
function process_key(e) {
    function is_special(k) {
        return ((32==k) || (27==k) || (37==k) || (39==k)|| (40==k) || (38==k) || (13==k));
    }
    //var Running = true;
	var e = window.event || e ;
	var Skip = (("keypress"== e.type) && ("keypress" != PrevEvent));
    if (is_special(e.keyCode) && (!Skip)) {
        Tetris.user_action(e.keyCode);
    }
	PrevEvent=e.type;
	return true;
}

function init_game(root_element) {
    Tetris = new TetrisGame(root_element, 8, 20, TetrisCssUI);
    Tetris.run();
}
