# `CLAUDE.md` - EbyYard

## The Golden Rule
When unsure about implementation details, ALWAYS ask the developer.

## Application Usage

- This application is used to have people select sandwhiches from a list and then display an order sheet of all users
- This list shows the sandwhich name and ingredient make up as well as a price it is divided by Foccacia and Hogie sandwhiches
- This list should be able to be edited (Names, Ingredients, Prices)
- The user should be able to enter their name and then select thier sandwhich
- Home screen should have 2 buttons 1 to order 1 to edit sandwhiches
- Edit will allow CRUD Actions on sandwhiches
- Order will prompt with a name input, then select 1 menu item and conifrm and add a note for prefrences/allergies
- This will be added to a database for the day that collect all the users who make an order
- There should be a third button to print order that displays a list of all people who have ordered and their sandwhiches, and notes per person for that day
- On the Print Order dsiplay there is an overall order amount break down of the quantity of each sandwhich and overall total price

### Technologies

- There needs to be a database that we store the overall order information
- Should use react and yarn styling can be tailwind


## Code Style and Patterns

### Anchor comments

Add specially formatted comments throughout the codebase, where appropriate, for yourself as inline knowledge that can be easily `grep`ped for.
