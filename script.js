import { Chess } from './board/js/chess.js/chess.js';

var game = new Chess;

var board = Chessboard('#board', {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoverSquare: onMouseoverSquare,
  onMouseoutSquare: onMouseoutSquare,
  onSnapEnd: onSnapEnd
});

var evaluate = function (board) {
  var evaluation = 0;
  
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      
      evaluation += getPieceValue(board[i][j],i,j);
    }
  }
  
  return evaluation;
}


function generateMoves(game, depth,maximizingPlayer,alpha,beta) {
  
  if (depth <= 0) {
    
    return evaluate(game.board());
  }

  const legalMoves = game.moves();
  if (legalMoves.length === 0) {
    return { move: null, value: 0 };
  }
  let bestValue = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  let bestMove = null;


  for (const move of legalMoves) {
    game.move(move);
    
    if (game.in_checkmate()){
      game.undo();
      bestMove = move;
      return { move: bestMove, value: Number.POSITIVE_INFINITY };
    }
    
    const childValue = generateMoves(game, depth - 1,!maximizingPlayer, alpha, beta);
    console.log(childValue)
    
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
    if (alpha > beta){
      break;
    }
    
  }
  
  
  if (depth === 3) {
    console.log("BEST VALUE: " + bestValue + " BEST MOVE: " + bestMove);
    return bestMove; // Return the best move at the root level
  } else {
    return bestValue; // Return the best value for the current player at other levels
  }
  
}


var bestMove = function (game) {
  
  var bestMove = generateMoves(game,3,false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
  return bestMove;


}
var getGameMove = function (game) {

  return bestMove(game);
}

var makeMove = function () {
  var move = getGameMove(game);
  game.move(move);
  setTimeout(function () {
    board.position(game.fen());
    if (game.in_checkmate()){
      alert("Black Wins!"); 
    }
  }, 1000);
  


}

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

function onDragStart(source, piece, position, orientation) {
  if (game.in_checkmate() === true || game.in_draw() === true) {
    return false;
  }
}

function onDrop(source, target) {
  var move = game.move({ from: source, to: target, promotion: 'q' });
  if (move == null) {
    return 'snapback';
  }
  console.log(move);
  game.move(move);
  if (game.in_checkmate()) {
    alert("You won! Good job!");
  } else if (game.in_threefold_repetition()){
    alert("Draw by three fold repitition");
  } else if(game.in_stalemate()){
    alert("Draw by stalemate");
  } else if(game.insufficient_material()){
    alert("Draw by insufficient material");
  }

  makeMove();
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

var getPieceValue = function (piece,x,y) {

  if (piece === null) {
    return 0;
  }
  
  var getAbsoluteValue = function (piece) {
    if (piece.type === 'p') {
      return 10 + PAWN[x][y];
    } else if (piece.type === 'r') {
      return 50 + ROOK[x][y] + game.moves({square: piece.square}).length;
    } else if (piece.type === 'n') {
      return 30 + KNIGHT[x][y];
    } else if (piece.type === 'b') {
      return 30 + BISHOP[x][y] + game.moves({square: piece.square}).length;
    } else if (piece.type === 'q') {
      return 90 + QUEEN[x][y] + game.moves({square: piece.square}).length;
    } else if (piece.type === 'k') {
      return 900 + KING[x][y];
    }
    throw "Unknown piece type: " + piece.type;
  };

  var absoluteValue = getAbsoluteValue(piece, piece.color === 'w');
  return piece.color === 'w' ? absoluteValue : -absoluteValue;
};






const KING = [
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-2, -3, -3, -4, -4, -3, -3, -2],
  [-0, -2, -2, -2, -2, -2, -2, -1],
  [2, 2, 0, 0, 0, 0, 2, 2],
  [2, 3, 1, 0, 0, 1, 3, 2]];
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
  [5, 5, 5, 5.1, 5.1, 5.5, 5, 5]
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


