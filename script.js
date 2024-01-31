import { Chess } from './board/js/chess.js/chess.js';

var game = new Chess;
//game.load('r3k2r/pppp2pp/8/8/8/8/PPP3PP/5K1R w kq - 0 1');
var board = Chessboard('#board', {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoverSquare: onMouseoverSquare,
  onMouseoutSquare: onMouseoutSquare,
  onSnapEnd: onSnapEnd
});

//evaluates the current position this is used when determining the best move for the bot
var evaluate = function (board) {
  var evaluation = 0;
  
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      
      evaluation += getPieceValue(board[i][j],i,j);
    }
  }
  
  return evaluation;
}
var quiessence = function(alpha,beta){

}

/*
  The Minimax algorithm employed here explores potential moves within a game by recursively analyzing each option and considering the optimal response from the opponent. 
  This process continues until a specified depth is reached, providing a strategy for determining the best move in a given position.
*/
function generateMoves(game, depth,maximizingPlayer,alpha,beta) {
  
  if (depth <= 0) {
    return evaluate(game.board());
  }

  const legalMoves = orderMoves(game.moves());
  
  if (legalMoves.length === 0) {
    return { move: null, value: 0 };
  }
  let bestValue = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  let bestMove = null;
  


  for (const move of legalMoves) {
    
    game.move(move);
    
    if (game.in_checkmate()){
      game.undo();
      return bestMove = move;
    }
    
    const childValue = generateMoves(game, depth - 1,!maximizingPlayer, alpha, beta);
    
    
    if (maximizingPlayer) {
      if (childValue > bestValue) {
        bestValue = childValue;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestValue);
    } else {
      if (childValue < bestValue) {
        bestValue = childValue;
        bestMove = move;
      }
      beta = Math.min(beta, bestValue);
    }
   
    game.undo();
    
    if (alpha >= beta){
      
      return bestMove;
    }
    
  }
  
  
  if (depth === 4) {
    
    return bestMove; // Return the best move at the root level
  } else {
    return bestValue; // Return the best value for the current player at other levels
  }
  
}

//gets the best move for the AI and plays it 
var makeMove = function () {

  /*
    calls the generate moves method which determines the best move for black. 
    Currently depth 4 is recommended until further optimization to allow it to search faster
  */
  var move = generateMoves(game,4,false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);;
  game.move(move);
  setTimeout(function () {
    board.position(game.fen());
    if (game.in_checkmate()){
      alert("Black Wins!"); 
    }
  }, 500);
  


}

//code for making squares gray to highlight a piece can move there
var greySquare = function (square) {
  var squareEl = $('#board .square-' + square);

  var background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }

  squareEl.css('background', background);
};

var removeGreySquares = function () {
  $('#board .square-55d63').css('background', '');
};

var greySquare = function (square) {
  var squareEl = $('#board .square-' + square);

  var background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }

  squareEl.css('background', background);
};

//restricts the user from moving pieces if the game is over
function onDragStart(source, piece, position, orientation) {
  if (game.in_checkmate() === true || game.in_draw() === true) {
    return false;
  }
}

/*
  When the user makes a valid move this method sees if the game has ended and if not the AI makes a move.
*/
function onDrop(source, target) {
  var move = game.move({ from: source, to: target, promotion: 'q' });
  if (move == null) {
    return 'snapback';
  }
  console.log(move);
  game.move(move);
  checkGameStatus();
  setTimeout(()=>{
    makeMove();
  },500);
  
  checkGameStatus();
}

function onMouseoverSquare(square, piece) {
  var moves = game.moves({
    square: square,
    verbose: true
  });


  if (moves.length === 0) return;

  greySquare(square);
  
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares(square);
}

function onSnapEnd() {
  board.position(game.fen());


}

/*
  This method evaluates a single piece on the board.
  It will add the initial value of the piece to a value that cooresponds with its position on the board
*/
var getPieceValue = function (piece,x,y) {

  if (piece === null) {
    return 0;
  }
  // + game.moves({square: piece.square}).length
  var getAbsoluteValue = function (piece) {
    switch (piece.type) {
      case 'p':
        return 10 + PAWN[x][y];
      case 'r':
        return 50 + ROOK[x][y];
      case 'n':
        return 30 + KNIGHT[x][y];
      case 'b':
        return 30 + BISHOP[x][y];
      case 'q':
        return 90 + QUEEN[x][y];
      case 'k':
        return 900 + KING[x][y];
      default:
        throw "Unknown piece type: " + piece.type;
    }
  };

  var absoluteValue = getAbsoluteValue(piece, piece.color === 'w');
  return piece.color === 'w' ? absoluteValue : -absoluteValue;
};





/*
  2D arrays that coorespond to the squares on the chess board. There is one for every kind of peice.
  The value of the square will be added when evaluating the position.
  This encourages the bot to put pieces on more active squares when no capture is available
*/
const KING = [
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-2, -3, -3, -4, -4, -3, -3, -2],
  [-0, -2, -2, -2, -2, -2, -2, -1],
  [2, 2, 0, 0, 0, 0, 2, 2],
  [50, 50, 1, -1, -1, 1, 50, 50]];
const QUEEN = [
  [-2, -1, -1, -.5, -.5, -1, -1, -2],
  [-1, 0, 0, 0, 0, 0, 0, -1],
  [-0, 0, .5, .5, .5, .5, 0, -1],
  [-.5, 0, .5, .5, .5, .5, 0, -.5],
  [0, 0, .5, .5, .5, .5, 0, -.5],
  [-1, .5, .5, .5, .5, .5, 0, -1],
  [-1, 0, .5, 0, 0, 0, 0, -1],
  [-2, -1, -1, -.5, -.5, -1, -1, -2]];
const ROOK = [
  [5, 5, 5, 5, 5, 5, 5, 5],
  [2, 2, 2, 2, 2, 2, 2, 2],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [5, 5, 10, 12, 12, 10, 5, 5]
];
const BISHOP = [
  [-2, -1, -1, -1, -1, -1, -1, -2],
  [-1, 0, 0, 0, 0, 0, 0, -1],
  [-1, 0, .5, 1, 1, .5, 0, -1],
  [-1, .5, .5, 1, 1, .5, .5, -1],
  [-1, 0, 1, 1, 1, 1, 0, -1],
  [-1, 1, 1, 1, 1, 1, 1, -1],
  [-1, .5, 0, 0, 0, 0, .5, -1],
  [-2, -1, -1, -1, -1, -1, -1, -2]];
const KNIGHT = [
  [-5, -2.5, -3, -3, -3, -3, -2.5, -5],
  [-4, -2, 0, 0, 0, 0, -2, -4],
  [-3, 0, 2, 1.5, 1.5, 2, 0, -3],
  [-3, .5, 1.5, 2, 2, 1.5, .5, -3],
  [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
  [-3, .5, 1, 1.5, 1.5, 1, .5, -3],
  [-4, -2, 0, .5, .5, 0, -2, -4],
  [-5, -4, -3, -3, -3, -3, -4, -5]
];
const PAWN = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 2, 2, 1, 1, 1],
  [.5, .5, 2, 4, 4, 1, .5, .5],
  [0, 0, 0, 2, 2, 0, 0, 0],
  [.5, -.5, -1, 0, 0, -1, -.5, .5],
  [-.5, 1, 1, -2, -2, 1, 1, -.5],
  [0, 0, 0, 0, 0, 0, 0, 0]];

const PSQT_SET = [KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN];


/*
  function to check if the game has ended and alerts the user
*/
function checkGameStatus(){
  if (game.in_checkmate()) {
    alert("You won! Good job!");
  } else if (game.in_threefold_repetition()){
    alert("Draw by three fold repitition");
  } else if(game.in_stalemate()){
    alert("Draw by stalemate");
  } else if(game.insufficient_material()){
    alert("Draw by insufficient material");
  }
}

/* 
  function to order the list of current moves. 
  This is used in combination with alpha beta pruning to signicantly speed up the search algorithm and allow for greater depth searching.
*/
function orderMoves(moves) {
  const orderedMoves = [];

  // Evaluate each move and store them with their evaluation scores
  for (const move of moves) {
    game.move(move);
    const evaluation = evaluate(game.board());
    orderedMoves.push({ move, evaluation });
    game.undo();
  }

  // Sort moves based on the evaluation scores in descending order
  orderedMoves.sort((a, b) => (game.turn() === 'w' ? b.evaluation - a.evaluation : a.evaluation - b.evaluation));

  // Extract and return the sorted moves
  return orderedMoves.map((moveObj) => moveObj.move);
}




