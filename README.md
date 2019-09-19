Assignment 3 - Persistence: Two-tier Web Application with Flat File Database, Express server, and CSS template
===

## What's Your Next Adventure?

http://a3-petrakumi.glitch.me

This website helps people log their trips for recordkeeping 

- the goal of the application is to offer users an easy to use interface to add/remove/modify their trips
- after struggling with integrating lowdb, express, and passport, the biggest challenge was creating a JSON object dynamically that contains the information needed to add it to the map. The JSON object would log just fine, but when I tried to get any attribute from it it would reult as being empty. I was unable to solve this problem with the time I was given for this homework.
- I chose to implement passport and lowdb as lowdb seemed like the easiest option for a small database, and we had guiding code from prof. Roberts about Passport which I found particularly helpful to get started with especially as a complete stranger to express, passport, and lowdbchoosing one because it seemed the easiest to implement is perfectly acceptable)
- I used mdb bootstrap for the login screen as I liked its design and ease of use, and getBootstrap for the submission form after authentication as I had it before and didn't want to change it
    - Changes I made to the login screen:
        - I changed the background color of the form and login/signup tabs
        - Changed how the tabs reacted on hover, on click, and when they were activated
    - Changes I made to the form after logging in
        - Change size of the buttons
        - Change text size and color for both labels and inputs
        - Changed default colors when autocomplete was used
        - Changed some of the layouts of the boxes
- the five Express middleware packages you used and a short (one sentence) summary of what each one does.
- Middleware I used:
     - bodyParser: parses requests so user can easily get request body without having to call JSON.parse()
     - express.static: serves static files more easily from a given directory
     - flash: stores messages that are then sent to the user usually when the user gets redirected
     - session: stores and creates sessions for users who are authenticated
     - passport: authenticates users based ont heir login info

## Technical - Achievements
- **Tech Achievement 1**: OAuth authentication via the GitHub strategy
- **Tech Achievement 2**: OAuth authentication via the LinkedIn strategy
- **Tech Achievement 3**: Google's Place search API to find the right name of a place given what the user inputted
** The last achievement was done as part of generating locations to put on the map, but although I was able to generate the locations and store them in an appropriately formatted JSON, I could never figure out how to pass that JSON to the map I was using, so you would not be able to see the result unless you look at the logs



### Design/Evaluation Achievements
- **Design Achievement 1**: Login screen smooth changing of tabs that looks like the body of the form is the same as the tab itself
- **Design Achievement 2**: Included a map to show all the places people submit
- **Design Achievement 3**: Dynamically generated table from the infromation stored on the database
- **Design Achievement 4**: Dynamically modified table/deleted row from the information that was given
- **Design Achievement 5**: Customized CSS for bootstrap in the login page, the form within the user's page, and the dynamically generated table
- **Design Achievement 6**: 

## Notes
- To log in to see a sample populated account, use these credentials: username: petrakumi, pass: petra
- The locations on the map are only sample locations to demonstrate how it would work
- I had misunderstood the deadline as being 11:59 pm for this homework, which is why I did not submit on time. I hope this will not negatively affect my grade.