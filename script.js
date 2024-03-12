async function validate() {
  const inputs = getInputs();
  const row = getCurrentRow();
  const word = getWord();

  if (!areInputsFieldsFilled(inputs)) {
    shakeRow(row);
    console.log("Please fill in all the letters in the row.");
    return false;
  }

  const isWordValid = await isValidWordv2(word);
  if (!isWordValid) {
    shakeRow(row);
    console.log("This word is not lexically correct. Please try again.");
    return false;
  }
  return true;
}

function shakeRow(row) {
  row.classList.add("shake-animation");
  setTimeout(() => {
    row.classList.remove("shake-animation");
  }, 600);
}

function areInputsFieldsFilled(inputs) {
  let isValid = true;
  inputs.forEach((input) => {
    if (input.value === "") {
      isValid = false;
      /*   input.classList.add("invalid");
    } else {
      input.classList.remove("invalid");*/
    }
  });
  return isValid;
}
function getWord() {
  const inputs = getInputs();
  return inputs.map((input) => input.value).join("");
}

async function isValidWord(word) {
  console.log(`API call to check if the ${word} is valid`);
  // Is this a valid 5 letter word?
  const res = await fetch("https://words.dev-apis.com/word/validate-word", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ word: word }),
  });

  const resObj = await res.json();
  return resObj.valid;
}

async function isValidWordv2(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status === 404) {
      console.error("404 Error! No Definitions Found.");
      return false;
    }

    const resObj = await res.json();
    if (resObj.title === "No Definitions Found") {
      return false;
    }
    return true;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
}

/**
 * Checks if a given character is a letter.
 *
 * @param {string} letter - The character to check.
 * @returns {boolean} - Returns true if the character is a letter, otherwise false.
 */
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

/**
 * Submits the current row and disables it,
 * calls program to perform validation and enables the next row.
 */
async function submitRow() {
  // Store the current row before disabling it (to enable the next row later)
  const currentRow = getCurrentRow();

  // Validation Logic - Check if the current row is valid
  if (!(await validate())) {
    return;
  }

  // Flip the tiles in the row and add colours
  flipRow(currentRow);

  // Add colour to the row

  // Set the "disabled" attribute of each element to true
  disableCurrentRow();

  // Enable the next row and set the focus to the first input
  enableNextRow(currentRow);
}

function getCurrentRow() {
  //   const currentRow = document.activeElement.parentElement.parentElement; //deprecated (requires focus on input field to get row)
  const activeRow = document.querySelector(".row:not(:has(input:disabled))");
  return activeRow;
}

/**
 * Disables all inputs in the current row.
 */
function disableCurrentRow() {
  const inputs = getInputs();
  inputs.forEach((input) => {
    input.setAttribute("disabled", true);
  });
}

function flipRow(row) {
  const tiles = Array.from(row.children); // Assuming each tile is a direct child of the row
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("flip-in-animation");
      tile.addEventListener("animationend", () => {
        tile.classList.remove("flip-in-animation");
        tile.classList.add("flip-out-animation");
        //TODO: Add colour to the tile here
        // tile.style.backgroundColor = "red";
        // tile.style.color = "white";
        // tile.style.border = "1px solid black";
        // Depends on if character at index is correct
        tile.addEventListener("animationend", () => {
          tile.classList.remove("flip-out-animation");
        });
      });
    }, index * 600); // Delay before the flip animation starts
  });
}

/**
 * Enables the next row of inputs by removing the "disabled" attribute from each element.
 * @param {HTMLElement} previousRowObject - The previous row object from which to determine the next row.
 */
function enableNextRow(previousRowObject) {
  let nextRow = previousRowObject.nextElementSibling;
  const inputs = getInputs(false, nextRow);
  // Set the "disabled" attribute of each element to true
  inputs.forEach((input) => {
    input.removeAttribute("disabled");
  });
  registerInputListeners();
  refocusInput();
}

/**
 * Retrieves a list of input elements based on the specified enabled state.
 *
 * @param {boolean} enabled - Determines whether to retrieve enabled or disabled input elements.
 * @param {HTMLElement} [element=window.document] - The element to search within. Defaults to the entire document.
 * @returns {Array<HTMLElement>} - An array of input elements matching the specified enabled state.
 */
function getInputs(enabled = true, element = window.document) {
  switch (enabled) {
    case true:
      return Array.from(element.querySelectorAll(".cell-input:enabled"));
    case false:
      return Array.from(element.querySelectorAll(".cell-input:disabled"));
  }
}

/**
 * Refocuses the input element based on its value.
 * If there is an empty input, it will be focused.
 * If all inputs are filled, the last filled input will be focused and the selection highlight will be hidden.
 */
function refocusInput() {
  const inputs = getInputs();
  const firstEmptyInput = inputs.find((input) => input.value === "");
  const lastFilledInput = inputs.reverse().find((input) => input.value !== "");

  if (firstEmptyInput) {
    firstEmptyInput.focus();
  } else {
    lastFilledInput.focus();
    //Hides the selection highlight
    lastFilledInput.setSelectionRange(
      lastFilledInput.value.length,
      lastFilledInput.value.length
    );
  }
}

function registerInputListeners() {
  let timer;
  const inputs = getInputs();

  inputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      if (isLetter(e.data)) {
        input.value = e.data.toUpperCase();
        const nextInput =
          input.parentElement.nextElementSibling?.querySelector(".cell-input");

        input.parentElement.classList.add("tile-pop-animation");
        setTimeout(() => {
          input.parentElement.classList.remove("tile-pop-animation");
        }, 600);

        if (nextInput) {
          nextInput.focus();
        }
      } else {
        input.value = "";
      }
    });
    input.addEventListener("mousedown", (e) => {
      e.preventDefault();
      refocusInput();
    });
    input.addEventListener("keyup", () => {
      clearTimeout(timer);
    });
    input.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          submitRow();
          break;
        case "Backspace":
          if (input.value === "") {
            timer = setTimeout(() => {
              const previousInput =
                input.parentElement.previousElementSibling?.querySelector(
                  ".cell-input"
                );
              if (previousInput) {
                previousInput.focus();
                previousInput.value = "";
              }
            }, 0); // Delay the focus to avoid the input value in previous field being deleted too early
            // Prevent the default backspace behavior to avoid deleting characters in the previous input
            e.preventDefault();
          }
          break;
      }
    });
  });
}

/**
 * Registers event listeners to reset the cursor focus on the input field.
 */
function registerCursorResetListener() {
  window.addEventListener("focus", () => {
    refocusInput();
  });
  window.addEventListener("click", () => {
    refocusInput();
  });

  const container = document.querySelector(".container");
  if (container) {
    container.addEventListener("click", () => {
      refocusInput();
    });
  }
}

async function getWordOfTheDay() {
  // Call API to get the word of the day
  fetch("https://words.dev-apis.com/word-of-the-day")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      // Use the data here
      wordOfTheDay = data.word.toUpperCase();
      console.log(wordOfTheDay);
      setLoading(false);

      return;
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
}

async function getWordOfTheDayv2() {
  try {
    const response = await fetch("https://words.dev-apis.com/word-of-the-day");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);
    // Use the data here
    return data.word.toUpperCase();
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
}

/**
 * Sets the loading state of the application. (Only used for false as loading in on by default)
 * @param {boolean} isLoadingBool - A boolean value indicating whether the application is in a loading state or not.
 */
function setLoading(isLoadingBool) {
  const infoBar = document.querySelector(".info-bar");
  const loader = document.querySelector(".loader");
  console.log("Loading: ", isLoadingBool);
  infoBar.classList.add("fade-out-animation");
  infoBar.addEventListener("animationend", () => {
    infoBar.classList.remove("fade-out-animation");
    loader.classList.toggle("hidden", !isLoadingBool);
  });
}

/**
 * Initializes the application.
 * This function registers the input, refocuses the input field, and sets up the cursor reset.
 */
let wordOfTheDay = "apple";
async function init() {
  registerInputListeners();
  registerCursorResetListener();
  refocusInput();

  wordOfTheDay = await getWordOfTheDayv2();
  setLoading(false);
  console.log(wordOfTheDay);
}

init();
