document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll(".cell");
  const result = document.querySelector("#result");
  const reset = document.querySelector("#reset");

  let board = Array(9).fill(0);
  let player = 1; // 1 para 'X' y -1 para 'O'
  let activePlay = true;

  // combinaciones ganadoras
  const checkWin = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const routeModel = "../../model/ttt_model.json";
  let model;

  tf.ready().then(async () => {
    model = await tf.loadLayersModel(routeModel);
    console.log("El modelo ha sido cargado");
  });

  function controlPlayByCeld(cellClick, cellIndex) {
    board[cellIndex] = player;
    cellClick.innerHTML = player === 1 ? "X" : "O";
  }

  function checkWinner() {
    let win = false;

    for (let i = 0; i < checkWin.length; i++) {
      const [a, b, c] = checkWin[i];
      if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
        win = true;
        break;
      }
    }

    if (win) {
      result.innerHTML = player === 1 ? "Ganaste" : "Perdiste";
      activePlay = false;
      return;
    }

    if (!board.includes(0)) {
      result.innerHTML = "Empate";
      activePlay = false;
      return;
    }

    player = player === 1 ? -1 : 1;
    if (player === -1) {
      result.innerHTML = "Turno de la computadora";
      handleMotionComputer();
    } else {
      result.innerHTML = "Es tu turno";
    }
  }

  function handleMotionComputer() {
    tf.tidy(() => {
      const tensorBoard = tf.tensor(board, [1, 9]);
      model
        .predict(tensorBoard)
        .data()
        .then((prediction) => {
          let bestMove = -1;
          let bestValue = -Infinity;

          for (let i = 0; i < prediction.length; i++) {
            if (board[i] === 0 && prediction[i] > bestValue) {
              bestMove = i;
              bestValue = prediction[i];
            }
          }

          if (bestMove >= 0) {
            board[bestMove] = -1;
            cells[bestMove].innerHTML = "O";
            checkWinner();
          }
        });
    });
  }

  function clickOnCells(e) {
    const cellClick = e.target;
    const cellIndex = parseInt(cellClick.getAttribute("data-index"));

    if (board[cellIndex] !== 0 || !activePlay) return;

    controlPlayByCeld(cellClick, cellIndex);
    checkWinner();
  }

  function resetGame() {
    board = Array(9).fill(0);
    activePlay = true;
    player = 1;
    result.innerHTML = "Es tu turno";
    cells.forEach((cell) => (cell.innerHTML = ""));
  }

  cells.forEach((cell) => cell.addEventListener("click", clickOnCells));
  reset.addEventListener("click", resetGame);
});
