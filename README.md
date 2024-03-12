# Wordle

A simple word game where you have to guess a word in 6 tries.

# Learned

- `input.select()` for selecting the text in an input field, highlights the text which I did not want. So I used `input.setSelectionRange(len(input), len(input))` to set the cursor to the end of the input field, when refocusing an input field that already contains text.

- Used `input` event specficially because it fires before the `keydown` and `keyup` events so that I can prevent the default behavior of the `keydown` event and then manually update the input field value (prevents letters from being entered into the input field and showing up in lowercase)

- Used `.row:not(:has(input:disabled))` selector to select all rows that do not have a disabled input field, because all of the rows but the active one have disabled input fields by default in the HTML; this is a handy way to get the object of the active row.

- Order of events for calling promises and network requests in my initialisation functions for web pages is important. I could await the promise that fetches the word from the server and call it first, but this would hold up the rest of the initialisation functions from running. Instead, I called the promise that fetches the word from the server last, so that the rest of the initialisation functions could run while the word was being fetched. (However for offline functionality, I would have to await the promise that fetches the `wordlist` from the server first, and then call the rest of the initialisation functions.)

# Objectives
1. Write the HTML. Get all the divs and such that you'll need. Make sure to link a stylesheet and a script to run your CSS and JS
2. Style it. Write the CSS to get to the state where everything _looks_ right.
3. Starting on the JS, get the core mechanic of typing down. You'll have to handle
    1. Handle a keystroke with a letter.
    2. Handle a wrong keystroke (like a number or spacebar). Ignore it.
    3. Handle "Enter" when the word is complete (go to the next line)
    4. Handle "Enter" when the word is incomplete (ignore it)
    5. Handle "Backspace" when there's a letter to delete
    6. Handle "Backspace" when there's no letter to delete
4. Handle the API request to get the word of the day
5. Handle checking just if the word submitted after a user hits enter is the word is the word of the day
6. Handle the "win" condition (I'd just start with `alert('you win'))`)
7. Handle the "lose" condition (I'd just start with `alert('you lose, the word was ' + word))`)
8. Handle the guess's correct letter in the correct space (the green squares)
9. Handle the guess's wrong letters outright (the gray squares)
10. Handle the yellow squares
    1. Handle the correct letters, wrong space (the yellow squares) naïvely. If a word contains the letter at all but it's in the wrong square, just mark it yellow.
    2. Handle the yellow squares correctly. For example, if the player guesses "SPOOL" and the word is "OVERT", one "O" is shown as yellow and the second one is not. Green squares count too.
11. Add some indication that a user needs to wait for you waiting on the API, some sort of loading spinner.
12. Add the second API call to make sure a user is requesting an actual word.
13. Add some visual indication that the user guessed something isn't an actual word (I have the border flash red on the current line)
14. Add some fun animation for a user winning 
