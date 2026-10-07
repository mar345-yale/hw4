# Homework 4 — AI Prompts

A running log of every prompt used with the AI assistant while completing Homework 4, grouped by problem, so the work can be reviewed later.

## Setup

1. okay, today we are going to work in the homework 4 folder. for the rest of the day, put all my stuff in there. prove it with a joke.txt
2. Great. now here is the scenario for today's project. I dont need you to take any action, I just want you to know roughly what we are doing. 

   Scenario: Campus Customs needs a real customer website with a helpful chatbot. We will build a React + Vite TypeScript front end and a Python FastAPI backend whose brain is a PydanticAI agent. By the end, shoppers should be ab le to browse products, create an account, chat about merch, see matching items appear on the page, and get honest answers about price and stock from a local database. I will give you a database later with tables for the product catalogue, inventory by size, and users. Product image files paths will be in the catalogue table. 

   For our sound, voice, and style, we will mirror the yalebulldogblue.com web page. 

   Okay. that is the scenario. we will work 1 problem at a time together to knock this out. Ready?

## Problem 1: Vibe Coder Prompts

1. perfect. before we continue, I need you to create a markdown file named AI_prompts.md. We will keep this updated as we work. In this mark down, I need you to put 13 sections labeled Problem 1 - 13. In each section, put the problem number and title, and all of my prompts for each problem. This prompt is Problem 1 - Vibe coder prompts

## Problem 2: Analyze the Database

1. Okay now for Problem 2: Analyze the database. 
   I pulled in a file called campus_customs.db. Take a look at that and get an understanding of the fields of each table. At a minimum, we need to understand catalogue, inventory, and users.
   After that, build another markdown file called output/harness.md. In that, annotate each table and its fields, and one short line on why each field matters or not for shop and/or the chatbot we will need. go!
2. before we get too far, lets build a virtual environment for this project.
3. keep the portkey_api_key in the .env from my root and we will use that to call openAI agents later. I will use model gpt-5.6-luna today
4. perfect. can you confirm the .venv is active now?
5. this is what i got from the terminal: source: no such file or directory: .venv/bin/activate
   mitchellrose@Mitchells-Air-4 AI Foundations %

## Problem 3: Build the Campus Customs Website

1. okay. we are active. lets move to Problem 3: Build the Campus Customs website.

   Lets build the front end of this site. Scaffold a React + Vite + TypeScript front end for Campus Customs. I want a navigation bar at the top that lings to the main pages: Home, Products, About Us, Log In, Create Account.

   To build the Home and About Us pages: pull data and wording from yalebulldogblue.com. Dont just copy and paste, re-write to have a more personal touch.

   For the Products page: I want it to show product images from the cataloge (use the image paths in the database, do NOT search the web or create new prods for this). Each product should have basic info associated with it (name, price, short description).

   Lets make each product open a single-item page when it is clicked on. The single item pages should have a large image on the right side with full product text on the left to include description, price, sizes/stock).

   I also want a chat interface in the bottom right of the site (a floating chat panel works fine). This should be viewable on all pages. We dont need the chat bot to talk to an agent just yet, we will do that later when we build the back end in a later problem. 

   I know we will need a small API soon to read the database. It's fine to start a simple FastAPI app in backend/main.py just to serve products and images.

## Problem 4: Create Account and Login

1. It looks great! Lets move to Problem 4: Create account and login.
   Lets build a normal create-account/login flow. If you already did this, no need to repeat the work.
   This should have create account: first name, last name, email, password, and confirm password. The login should just be email and password. 
   New accounts will go into the users table of the database. Make sure they are secured in a way that hackers cant access them.
   The seed database already has a test user account. I want to be able to test that once you are done.
2. no need to wire that into the root .env.
3. before we move on, i need you to update the output/harness.md with how the auth works (waht is stored for a user and how passwords are protected)

## Problem 5: PydanticAI Agent Backend

1. Great! lets move to Problem 5: PydanticAI agent backend.
   Now lets build that shop chatbot as a PydanticAI agent behind FastAPI, plugged into the front end chat widget. Put the API app in backend/main.py (this is the file we run with Uvicorn). Keep the agent as these four files next to it:
   backend/prompts/prompt.md (system prompt)
   backend/agent.py (agent entry / wiring
   backend/toos.py (tools the agent can call)
   backend/models.py (pydantic / pydanticAI structured types)

   In main.py, show a chat route so a message from the website returns a reply from the agent. Use the Ai model API key for this agent as discussed earlier.

   Put Campus Customs voice and safety basics into prompts/prompt.md. Start or update types in models.py for chat replies/product cards as needed.

   Make sure the backend runs from the backend/ folder like this: uvicorn main:app --reload --port 8000
2. The chat bot works perfectly and looks great. dont make any changes for now! 
   In output/harness.md, note how the front end talks to FastAPI and how the agent is loaded (prompt file + model)

## Problem 6: Tools (Product Info and Stock)

1. Okay now for Problem 6: Tools (product info and stock)
   Note: if any of this work has already been done, do not waste time redoing it.

   Give the agent tools that look up real information from campus_customs.db: product description, price, how many are in stock (by size when asked).
   The agent MUST use the database and never invent prices or quantities. If something is out of stock, say so.

   After that, expand upon prompts/prompt.md so the agent knows to call the tools for price and stock quiestions. Add or update return types in models.py
2. In output/harness.md, list each tool and explain which model feilds we chose for lookup results and why.

## Problem 7: Chat Search That Updates the Page

1. okay now for Problem 7: Chat seach that updates the page.

   I want to add a new feature to the site. When a customer asks about a type of item in the chat, the agent should search the catalogue and the WEBSITE should dynamically show those matching items as product cards (image, name, price, short info).
   This is an API contract: the agent returns structures product matches and then the front end renders them on the site.

   I dont want this to change the single item page behavior we built back in problem 3.
2. thanks for the fix! Now i need you to update the prompts/prompt.md and output/harness.md so it is clear how search results reach the page

## Problem 8: Customer Memory

1. great. Lets move to Problem 8: Customer memory.

   When a shopper is logged in to the site, I want their chat history saved in the databbase in an appropriate table and reload it when they return to the site and are logged back in again. The agent should know who is chatting (name, email) - put that in agent deps (or an equivalent clear pattern) and/or tools the agent can call.
   Also pass enought page context that if someone is on a product page and asks something like "do you have this in pink?", the agent knows which item they mean. Feel free to put code into the agent context if needed to do this.

   Also make it so Guests can still chat, but the history only needs to persist for the logged-in users.
2. Sweet. Now in the output/harness.md, document how user chat history is stored, what customer fields the agent sees, and how page context is passed.

## Problem 9: Usability Improvements

1. Okay now for Problem 9: Usability improvements. I want to make some improvements to the site.
   Specifically I want to improve 2 front-end usability improvements and 2 agent/backend usability improvements.
   For front-end improvements, target things that make the site look better and make it easier to use. 
   For agent/backend improvements, target things that make the agent output better, more accurate, or safer. These could be new tools or things that make the agent run faster/cheaper.
   Give me at least 4 options for each and I will chose which improvements to make.
2. (Selections) Front-end: Loading & empty/error states; Quick-reply chips in chat. Agent/backend: Validate agent output vs DB; Trim history + cap tokens.
3. Build an output/usability.md and put what we added and no longer than 2 sentances about why it hleps the site shopping experience or business

## Problem 10: Style the Website

1. Okay now for Problem 10: Style the website.
   I want to enhance the look of the website to feel more welcoming. I dont want to change any functions we have, as the site is working perfectly. This should all be front end changes.
   1. I want Yale's real mascot, Hansome Dan to appear in the homepage with a big smile.
   2. Lets move away from the black/blue theme for this project. I'd rather it be white and blue to be more inviting. 
   3. When the chat bot responds to a customer, I want the response to be accompanied by a nice dog bark to match the Handome Dan vibe.
   4. Lets update the heading on the home page. I Want "Campus Customs" to be more pronounced!
2. Handsome Dan is a bulldog that looks like this photo. Please change the html to be more bulldog like. [photo of the real Handsome Dan attached]
3. Now build an output/design.md and include what we changed and why it should help customers stick andround and buy. Be succinct.

## Problem 11: Site Testing (App Check)

1. Okay now for problem 11: Site testing (app check)
   I want you to run the live site and test the following 3 things: chat checking the inventory level of an item (noest stock/price fromthe DB), the dynamic search-result cards appearing after a categor question (e.g hoodies), and one of the usability features we added in problem 9.
   I want all of this documented in a output/app_check.html (a page you can double-click and open) that includes 3 clear sceenshots and short captions for each of the 3 tests.
   This html should be easy to grade with headings for each check, a screenshot for each, and one or two sentaces on what the screensho proves. Put the screenshot image files in output/app_check_images/ and link them from app_check.html with relative paths (for example app_check_images/inventory.png)

## Problem 12: Audit Trail, Safety, Finish Harness

1. That looks great. Now time for Ptoblem 12: Audit train, safety, finish harness. 
   Keep an append-only output/audit_trail.json of agent-loop activity (time, tool name, short args/result, stop reason). Dont wipe it between runs. 
   I also want to add some safety rules to the agent. Give me a few options and we will pick 3. Aftter they are incorporated, add them to prompts/prompt.md.
   Then finish output/harness.md so it is clear how the system now works. Include: Model fields in models.py and why we chose them, tools and abilities, safetly rules, and finally specs (loop limits, result caps, models, how to run front + back.) Go!

## Problem 13: Push to GitHub and Submit the URL

1. Okay now for Problem 13: Push to GitHub and submit the URL.
   We are going to package this up into one folder so I can then publish to github for grading. Build a file named hw4 that is organized like the photo attached to this prompt. Do NOT put my real .env, campus_customs.db, or product images in the GitHub repo. Use .gitignore. Include .env.example with placeholders only!!!
   The agent itself is four files under backend/ : prompts/prompt.md , agent.py , tools.py , and models.py.
   README.md should explain how to run the front end and back end after placing the data pack.
