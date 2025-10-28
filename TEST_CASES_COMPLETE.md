# FRIDGE2FORK: SOFTWARE TEST PLAN (STP)

## Test Plan Overview

**Project Name:** Fridge2Fork - AI Image Analyzer for Smart Recipe Planning and Waste Management  
**Test Plan Version:** 1.0  
**Date:** October 28, 2025  
**Testing Lead:** Andre Miles Calledo  
**Development Team:**

- Calledo, Andre Miles
- Igcalinos, James Basti
- Mahinay, Krishnan

### Testing Approach

The testing for the Fridge2Fork application follows an incremental and iterative approach, aligning with the Incremental Software Development Model. Testing is conducted continuously throughout the development lifecycle, with specific validation phases after each of the four increments are completed.

### Testing Types

- **Unit Testing:** Individual component validation
- **Integration Testing:** Module interaction verification
- **User Acceptance Testing (UAT):** Functionality validation against user requirements
- **Cross-Browser Testing:** Chrome, Firefox, Safari compatibility
- **Responsive Design Testing:** Desktop, tablet, and mobile devices

### Test Environment

- **Platform:** Online-based (remote testing)
- **Test Users:** 10-15 users (friends and family)
- **Devices:** Personal computers, smartphones, tablets
- **Browsers:** Chrome, Firefox, Safari

---

## Test Cases

### TC-001: User Registration

| **Field**               | **Details**             |
| ----------------------- | ----------------------- |
| **Test Case ID**        | TC-001                  |
| **Test Design By**      | James Basti Igcalinos   |
| **Test Design Date**    | October 15, 2025        |
| **Test Priority**       | High                    |
| **Module Name**         | User Account Management |
| **Test Executed By**    | Krishnan Mahinay        |
| **Test Title**          | User Registration       |
| **Test Execution Date** | October 19, 2025        |

**Description:** This test case verifies that a new user can successfully create an account using both the standard email/password method and the Google OAuth 2.0 provider.

**Pre-conditions:**

- User must be on the application's Login/Register page
- User must not have an existing account with the test email

**Dependencies:** Firebase Authentication service must be running and correctly configured.

**Post-conditions:**

- A new user record is created in the Firebase Authentication database
- The user is automatically logged in and redirected to the application's homepage

| Step | Test Steps                                                                                   | Test Data               | Expected Result                                                | Actual Result                                                        | Status |
| ---- | -------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- | ------ |
| 1    | Navigate to the homepage and click "Get Started" or "Sign Up" button to open the login modal | N/A                     | The login modal should open with "Sign Up" tab visible         | The login modal opens successfully with Sign Up form displayed       | Pass   |
| 2    | Provide Full Name in the registration form                                                   | James Basti Igcalinos   | The name field accepts the input and displays it               | Name is successfully entered and displayed                           | Pass   |
| 3    | Provide valid email address                                                                  | jamesbasti200@gmail.com | Email field accepts valid email format                         | Email is accepted without validation errors                          | Pass   |
| 4    | Provide a strong password (min 6 characters)                                                 | Helloworld1             | Password field accepts the input and masks it                  | Password is accepted and properly masked                             | Pass   |
| 5    | Confirm password in the confirmation field                                                   | Helloworld1             | Password confirmation matches the original password            | Passwords match, no error shown                                      | Pass   |
| 6    | Click "Sign Up" button                                                                       | N/A                     | Account should be created and user redirected to the home page | User account is successfully created and redirected to the home page | Pass   |

**Alternative Flow - Google OAuth:**

| Step | Test Steps                            | Test Data            | Expected Result                                    | Actual Result                       | Status |
| ---- | ------------------------------------- | -------------------- | -------------------------------------------------- | ----------------------------------- | ------ |
| 1    | Click "Continue with Google" button   | N/A                  | Google OAuth popup appears                         | Google sign-in window opens         | Pass   |
| 2    | Select a Google account and authorize | Valid Google Account | User is authenticated via Google                   | Successfully authenticated          | Pass   |
| 3    | Verify redirection                    | N/A                  | User is redirected to homepage with active session | Redirected to homepage successfully | Pass   |

---

### TC-002: User Login

| **Field**               | **Details**             |
| ----------------------- | ----------------------- |
| **Test Case ID**        | TC-002                  |
| **Test Design By**      | James Basti Igcalinos   |
| **Test Design Date**    | October 15, 2025        |
| **Test Priority**       | High                    |
| **Module Name**         | User Account Management |
| **Test Executed By**    | Andre Miles Calledo     |
| **Test Title**          | User Login              |
| **Test Execution Date** | October 19, 2025        |

**Description:** This test case verifies that a registered user can successfully log in using both the standard email/password method and the Google OAuth 2.0 provider.

**Pre-conditions:**

- User must have a pre-existing, registered account
- User must be logged out

**Dependencies:** Firebase Authentication service must be running.

**Post-conditions:**

- User is successfully authenticated
- The system retrieves their session
- User is redirected to the Homepage with access to personal inventory and meal plans

| Step | Test Steps                                                             | Test Data               | Expected Result                                          | Actual Result                                            | Status |
| ---- | ---------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------- | -------------------------------------------------------- | ------ |
| 1    | Navigate to the homepage and click "Log In" button to open login modal | N/A                     | Login modal should open with "Log In" tab active         | Login modal opens with Log In form displayed             | Pass   |
| 2    | Enter a valid registered email address                                 | jamesbasti200@gmail.com | Email field accepts the input                            | Email is successfully entered                            | Pass   |
| 3    | Enter the correct password                                             | Helloworld1             | Password field accepts the input and masks it            | Password is accepted and masked                          | Pass   |
| 4    | Click "Log In" button                                                  | N/A                     | User should be authenticated and redirected to home page | User login is successful and redirected to the home page | Pass   |

---

### TC-003: Ingredient Upload Functionality

| **Field**               | **Details**                     |
| ----------------------- | ------------------------------- |
| **Test Case ID**        | TC-003                          |
| **Test Design By**      | James Basti Igcalinos           |
| **Test Design Date**    | October 16, 2025                |
| **Test Priority**       | High                            |
| **Module Name**         | Ingredient Recognition Module   |
| **Test Executed By**    | Krishnan Mahinay                |
| **Test Title**          | Ingredient Upload Functionality |
| **Test Execution Date** | October 19, 2025                |

**Description:** This test case verifies that a user can successfully upload an image of ingredients. It supports both "click to select" and "drag-and-drop" methods.

**Pre-conditions:**

- User must be logged in to an active account
- User must be on the Homepage where the upload section is visible

**Dependencies:** Firebase Storage must be functional to receive the image.

**Post-conditions:** A valid image is accepted and sent to the Google Vision API for processing.

| Step | Test Steps                                                                                            | Test Data                                                  | Expected Result                                                                                     | Actual Result                                                                                         | Status |
| ---- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| 1    | Navigate to the Homepage. Click the "Upload Image" button in the upload zone and select an image file | Test_image.jpg (JPG format, 2MB, clear fridge photo)       | The file should be accepted. A loading spinner appears, followed by the "Ingredients Found" section | The file upload is successful. A loading spinner appears, followed by the "Ingredients Found" section | Pass   |
| 2    | Drag a valid PNG file into the "Drag and drop or click to upload" area                                | Test_image.png (PNG format, 1.5MB, clear ingredient photo) | The file should be accepted. Loading indicator shows processing, then ingredients are detected      | File is accepted via drag-and-drop. Processing completes and ingredients are displayed                | Pass   |

**Negative Test Cases:**

| Step | Test Steps                     | Test Data               | Expected Result                                                                           | Actual Result                                    | Status |
| ---- | ------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------ | ------ |
| 3    | Upload an invalid file type    | document.pdf            | System should reject the file with error message "Please upload an image file (JPG, PNG)" | Error message displayed correctly, file rejected | Pass   |
| 4    | Upload an extremely large file | large_image.jpg (>10MB) | System should show error or compress the image before processing                          | File is handled appropriately with size warning  | Pass   |

---

### TC-004: Ingredient Detection Accuracy

| **Field**               | **Details**                   |
| ----------------------- | ----------------------------- |
| **Test Case ID**        | TC-004                        |
| **Test Design By**      | James Basti Igcalinos         |
| **Test Design Date**    | October 16, 2025              |
| **Test Priority**       | High                          |
| **Module Name**         | Ingredient Recognition Module |
| **Test Executed By**    | Andre Miles Calledo           |
| **Test Title**          | Ingredient Detection Accuracy |
| **Test Execution Date** | October 19, 2025              |

**Description:** This test case verifies that the Google Vision API integration correctly identifies ingredients from various uploaded images and populates the inventory list.

**Pre-conditions:**

- User is logged in
- Image upload (TC-003) was successful

**Dependencies:** Google Cloud Vision API must be enabled and reachable.

**Post-conditions:** A list of detected ingredients is displayed to the user for confirmation.

| Step | Test Steps                                                 | Test Data                                 | Expected Result                                                                         | Actual Result                                                                          | Status |
| ---- | ---------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| 1    | Upload a clear, well-lit image with common, distinct items | Fridge.jpg (Contains: Chicken, egg, pork) | The system correctly identifies "chicken," "egg," and "pork" in the ingredient list     | The system successfully identifies "chicken," "egg," and "pork" in the ingredient list | Pass   |
| 2    | Review the detected ingredients list                       | N/A                                       | Ingredients are displayed with confidence scores and categories (proteins, dairy, etc.) | All ingredients shown with proper categorization                                       | Pass   |
| 3    | Verify ingredient categorization                           | N/A                                       | Chicken categorized as "proteins", egg as "proteins/dairy", pork as "proteins"          | Categorization is accurate                                                             | Pass   |

---

### TC-005: Inventory Management (Add/Remove Ingredients)

| **Field**               | **Details**                                   |
| ----------------------- | --------------------------------------------- |
| **Test Case ID**        | TC-005                                        |
| **Test Design By**      | James Basti Igcalinos                         |
| **Test Design Date**    | October 16, 2025                              |
| **Test Priority**       | High                                          |
| **Module Name**         | Ingredient Recognition Module                 |
| **Test Executed By**    | Krishnan Mahinay                              |
| **Test Title**          | Inventory Management (Add/Remove Ingredients) |
| **Test Execution Date** | October 19, 2025                              |

**Description:** This test verifies that the user can manually add new ingredients and remove existing (detected or manual) ingredients from their inventory list.

**Pre-conditions:** User is on the Homepage or Inventory page with detected ingredients.

**Dependencies:** Firestore database must be writable to update the user's inventory.

**Post-conditions:** The user's inventory list in the database is accurately updated.

| Step | Test Steps                                                                    | Test Data                           | Expected Result                                                                  | Actual Result                                                               | Status |
| ---- | ----------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| 1    | After TC-004, click the "Add More" button below the detected ingredients list | Action: Click "Add More"            | A modal or input field should appear to manually add ingredients                 | Modal opens with input field for ingredient name and quantity               | Pass   |
| 2    | Enter ingredient name and quantity                                            | Ingredient: "tomato", Quantity: "3" | Ingredient should be added to the list with specified quantity                   | "Tomato (3)" is successfully added to the inventory list                    | Pass   |
| 3    | Navigate to "My Inventory" page via the navbar                                | N/A                                 | Inventory page loads showing all confirmed ingredients                           | Inventory page displays all ingredients including manually added ones       | Pass   |
| 4    | Click the "Delete" (X) icon on an existing item                               | Item: "chicken"                     | The item "chicken" should be immediately removed from the list with confirmation | The item "chicken" is successfully removed from the list after confirmation | Pass   |
| 5    | Verify the deletion persists                                                  | Refresh the page                    | The deleted ingredient should not reappear                                       | Ingredient remains deleted, database updated                                | Pass   |

---

### TC-006: Generate Recipe (from Main Inventory)

| **Field**               | **Details**                           |
| ----------------------- | ------------------------------------- |
| **Test Case ID**        | TC-006                                |
| **Test Design By**      | James Basti Igcalinos                 |
| **Test Design Date**    | October 17, 2025                      |
| **Test Priority**       | High                                  |
| **Module Name**         | Recipe Generation Module              |
| **Test Executed By**    | Andre Miles Calledo                   |
| **Test Title**          | Generate Recipe (from Main Inventory) |
| **Test Execution Date** | October 19, 2025                      |

**Description:** This test verifies that the OpenAI API generates relevant recipes based on the user's main inventory.

**Pre-conditions:** User has a confirmed inventory list (per TC-005) with at least 3-4 ingredients.

**Dependencies:** OpenAI API must be reachable and API key configured.

**Post-conditions:** A list of recipe suggestions is displayed to the user.

| Step | Test Steps                                                                 | Test Data                                                | Expected Result                                                                                             | Actual Result                                                                                                       | Status |
| ---- | -------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | On the Homepage, click "Generate Recipes" button with a standard inventory | Inventory: "tomato", "rice", "chicken", "pork" (4 items) | System shows loading indicator while processing                                                             | Loading spinner appears with "Generating recipes..." message                                                        | Pass   |
| 2    | Wait for recipe generation to complete                                     | Processing time: ~5-10 seconds                           | The API should return 3-5 relevant recipes based on available ingredients                                   | System generates recipes successfully                                                                               | Pass   |
| 3    | Verify recipe relevance                                                    | N/A                                                      | Recipes should use ingredients from the inventory (e.g., "Pork and Tomato Rice Bowl", "Chicken Fried Rice") | The API returns relevant recipes: "Pork and Tomato Rice Bowl", "Chicken Stir-Fry with Rice", "Tomato Chicken Curry" | Pass   |
| 4    | Check recipe cards display                                                 | N/A                                                      | Each recipe card shows: name, image, cooking time, difficulty, calories                                     | All recipe cards display complete information with proper formatting                                                | Pass   |
| 5    | Verify recipes are saved to Firebase                                       | Check Firestore                                          | Generated recipes should be stored in user's recipes collection                                             | Recipes successfully saved to Firestore with timestamp                                                              | Pass   |

---

### TC-007: Recipe UI Display

| **Field**               | **Details**              |
| ----------------------- | ------------------------ |
| **Test Case ID**        | TC-007                   |
| **Test Design By**      | James Basti Igcalinos    |
| **Test Design Date**    | October 17, 2025         |
| **Test Priority**       | Medium                   |
| **Module Name**         | Recipe Generation Module |
| **Test Executed By**    | Krishnan Mahinay         |
| **Test Title**          | Recipe UI Display        |
| **Test Execution Date** | October 19, 2025         |

**Description:** This test ensures that when a user clicks on a generated recipe, all its details (name, time, ingredients, instructions) are displayed correctly and clearly.

**Pre-conditions:** A list of recipes has been generated (per TC-006).

**Dependencies:** Frontend UI components must be functional.

**Post-conditions:** The user can clearly read and understand the full recipe.

| Step | Test Steps                                                            | Test Data                             | Expected Result                                                                                      | Actual Result                                                                          | Status |
| ---- | --------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| 1    | From the recipe list, click on a recipe card or "View Details" button | Click "Pork and Egg Fried Rice"       | A full-page recipe detail view should open, displaying complete recipe information                   | Full recipe detail page successfully opens with complete information                   | Pass   |
| 2    | View the recipe header section                                        | N/A                                   | Recipe name, hero image, cooking time, difficulty level, and calorie count are prominently displayed | All header information is clearly visible and properly formatted                       | Pass   |
| 3    | Scroll to ingredients section                                         | N/A                                   | Complete list of ingredients with quantities and units is displayed                                  | All ingredients listed: "2 cups rice", "200g pork", "2 eggs", "1 tbsp soy sauce", etc. | Pass   |
| 4    | Scroll to instructions section                                        | N/A                                   | Step-by-step cooking instructions are displayed with clear numbering                                 | Instructions shown in numbered steps with clear, detailed descriptions                 | Pass   |
| 5    | Verify additional recipe information                                  | N/A                                   | Nutrition benefits, used ingredients from inventory, and missing ingredients are shown               | All additional information displayed correctly                                         | Pass   |
| 6    | Check match percentage indicator                                      | N/A                                   | Match percentage (e.g., "80% match") based on available ingredients is shown                         | Match percentage "75% - You have most ingredients" displayed                           | Pass   |
| 7    | Test "Back" navigation button                                         | Click back arrow or "Back to Recipes" | Should return to the recipe list or homepage                                                         | Successfully navigates back to recipe list                                             | Pass   |

---

### TC-008: Meal Plan Management (Add/Remove)

| **Field**               | **Details**                       |
| ----------------------- | --------------------------------- |
| **Test Case ID**        | TC-008                            |
| **Test Design By**      | James Basti Igcalinos             |
| **Test Design Date**    | October 17, 2025                  |
| **Test Priority**       | Medium                            |
| **Module Name**         | Meal Planning Module              |
| **Test Executed By**    | Andre Miles Calledo               |
| **Test Title**          | Meal Plan Management (Add/Remove) |
| **Test Execution Date** | October 19, 2025                  |

**Description:** This test verifies that a user can add recipes to specific meal slots (Breakfast, Lunch, Dinner) and remove them from the weekly plan.

**Pre-conditions:**

- User is logged in
- User has generated recipes available (per TC-006)
- User has navigated to the Meal Plan page

**Dependencies:** Firestore database must be writable to save the meal plan.

**Post-conditions:** The user's weekly meal plan calendar is correctly updated and persisted.

| Step | Test Steps                                           | Test Data                                                  | Expected Result                                                                                   | Actual Result                                                                          | Status |
| ---- | ---------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| 1    | Navigate to "Meal Plan" page via navbar              | N/A                                                        | Meal Plan page loads with weekly calendar showing Monday-Sunday with Breakfast/Lunch/Dinner slots | Meal Plan page displays correctly with all 21 meal slots (7 days × 3 meals)            | Pass   |
| 2    | Click on an empty meal slot (e.g., Monday Breakfast) | Day: Monday, Meal: Breakfast                               | A modal opens showing available recipes (Recent and Previous tabs)                                | Modal opens with recipe selection interface                                            | Pass   |
| 3    | Select a recipe from the "Recent" tab                | Recipe: "Pork and Egg Fried Rice"                          | Recipe is highlighted when selected                                                               | Recipe card is highlighted with selection indicator                                    | Pass   |
| 4    | Click "Assign to Meal Plan" or confirm selection     | N/A                                                        | Recipe is assigned to Monday Breakfast slot, modal closes                                         | Recipe successfully assigned to Monday Breakfast, displays on calendar                 | Pass   |
| 5    | Repeat for Monday Lunch                              | Recipe: "Spicy Chicken Stir-Fry", Day: Monday, Meal: Lunch | Recipe is assigned to Monday Lunch                                                                | "Spicy Chicken Stir-Fry" assigned to Monday Lunch slot                                 | Pass   |
| 6    | Repeat for Monday Dinner                             | Recipe: "Egg & Pork Stir-Fry", Day: Monday, Meal: Dinner   | Recipe is assigned to Monday Dinner                                                               | "Egg & Pork Stir-Fry" assigned to Monday Dinner slot                                   | Pass   |
| 7    | Verify meal plan statistics update                   | N/A                                                        | Total cook time, planned meals count, and ingredients needed update automatically                 | Statistics show: "3 meals planned", "Total cook time: 65 min", "12 ingredients needed" | Pass   |
| 8    | Click the "X" or "Remove" button on Monday Breakfast | N/A                                                        | Confirmation dialog appears                                                                       | "Remove this meal from your plan?" dialog shown                                        | Pass   |
| 9    | Confirm removal                                      | Click "Confirm"                                            | Recipe is removed from the slot, statistics update                                                | Recipe removed successfully, stats update to "2 meals planned"                         | Pass   |
| 10   | Refresh the page                                     | N/A                                                        | Meal plan persists with current assignments                                                       | All meal assignments remain after page refresh                                         | Pass   |

---

### TC-009: Move Item to Waste Management Bin

| **Field**               | **Details**                       |
| ----------------------- | --------------------------------- |
| **Test Case ID**        | TC-009                            |
| **Test Design By**      | James Basti Igcalinos             |
| **Test Design Date**    | October 18, 2025                  |
| **Test Priority**       | High                              |
| **Module Name**         | Waste Tracking Module             |
| **Test Executed By**    | Krishnan Mahinay                  |
| **Test Title**          | Move Item to Waste Management Bin |
| **Test Execution Date** | October 19, 2025                  |

**Description:** This test verifies that users can add/edit expiry dates and that items can be manually moved to the "Waste Management Bin" to be classified as leftovers.

**Pre-conditions:**

- User has a confirmed inventory list in their "My Inventory" section (per TC-005)
- User is on the Inventory page

**Dependencies:** Firestore database must be writable.

**Post-conditions:**

- Item is removed from "My Inventory"
- Item now appears in the "Waste Management Bin" UI

| Step | Test Steps                                                              | Test Data                                                  | Expected Result                                                           | Actual Result                                                               | Status |
| ---- | ----------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| 1    | On the "My Inventory" page, locate an ingredient with expiry date field | Item: "Lettuce" with default expiry "5 days left"          | The item displays with current expiry date                                | "Lettuce - 5 days left" is visible in inventory                             | Pass   |
| 2    | Click the "Edit" (pencil icon) next to the expiry date                  | Item: "Lettuce"                                            | An input field appears to edit the expiry days                            | Edit input field appears with current value "5"                             | Pass   |
| 3    | Change the expiry date to indicate it's expiring soon/expired           | New value: "0" (expired today) or "-1" (expired yesterday) | The expiry date updates and item may be flagged as expiring               | Expiry updated to "Expired" with red warning indicator                      | Pass   |
| 4    | Click "Save" or confirm the expiry date change                          | N/A                                                        | The new expiry date is saved to the database                              | Expiry date successfully saved, item shows urgent status                    | Pass   |
| 5    | Scroll down to the "Waste Management Bin" section on the same page      | N/A                                                        | A separate section shows items marked as expired or waste                 | "Waste Management Bin" section is visible below inventory                   | Pass   |
| 6    | For an expired item, click "Move to Waste Bin" or the trash icon        | Item: "Lettuce" (expired)                                  | Confirmation dialog appears: "Move this item to waste bin?"               | Confirmation dialog displayed                                               | Pass   |
| 7    | Confirm the action                                                      | Click "Confirm"                                            | Item is removed from "My Inventory" and appears in "Waste Management Bin" | "Lettuce" successfully moved to Waste Management Bin                        | Pass   |
| 8    | Verify the item is in the Waste Bin                                     | N/A                                                        | Item shows in Waste Bin with category and days expired                    | "Lettuce" appears in Waste Bin with "Expired 0 days ago" and action buttons | Pass   |

---

### TC-010: Waste Bin Actions (Reuse, Recycle, Recover)

| **Field**               | **Details**                                 |
| ----------------------- | ------------------------------------------- |
| **Test Case ID**        | TC-010                                      |
| **Test Design By**      | James Basti Igcalinos                       |
| **Test Design Date**    | October 18, 2025                            |
| **Test Priority**       | High                                        |
| **Module Name**         | Waste Tracking Module                       |
| **Test Executed By**    | Andre Miles Calledo                         |
| **Test Title**          | Waste Bin Actions (Reuse, Recycle, Recover) |
| **Test Execution Date** | October 19, 2025                            |

**Description:** This test verifies the three actions a user can take on a "leftover" item in the Waste Bin, implementing the 4Rs framework: Reuse (generate leftover recipe), Recycle (disposal tips), and Recover (composting guidance).

**Pre-conditions:**

- There is at least one item in the "Waste Management Bin" (from TC-009)
- User is on the Inventory page viewing the Waste Management Bin section

**Dependencies:**

- OpenAI API (for leftover recipe generation)
- Firestore (for storing guidance and actions)

**Post-conditions:**

- The correct action is performed (recipe generated or tips given)
- The item is removed from the bin after action is completed

| Step | Test Steps                                                                     | Test Data                                                        | Expected Result                                                                                                                    | Actual Result                                                                                          | Status |
| ---- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------ |
| 1    | In the Waste Management Bin, click "Reuse" button on a leftover vegetable item | Item: "Lettuce" (expired)                                        | System shows loading indicator and generates leftover recipes using this ingredient                                                | Loading spinner appears with "Generating leftover recipes..." message                                  | Pass   |
| 2    | Wait for leftover recipe generation                                            | Processing time: ~5-8 seconds                                    | System generates 2-3 recipes specifically for using leftover/wilted lettuce (e.g., "Wilted Lettuce Soup", "Lettuce Stem Stir-Fry") | Successfully generated recipes: "Leftover Lettuce Wrap Salad", "Wilted Greens Soup"                    | Pass   |
| 3    | View the generated leftover recipes                                            | N/A                                                              | Recipes are displayed in a modal or new section with special "Leftover Recipe" badge                                               | Recipes shown with "♻️ Leftover Recipe" badge and sustainability tips                                  | Pass   |
| 4    | Click "Recycle" button on a non-compostable waste item                         | Item: "Plastic food container" (if applicable) or skip to step 6 | A modal appears with recycling guidance and disposal tips                                                                          | Modal displays: "Recycling Guidelines" with proper disposal instructions                               | Pass   |
| 5    | Read recycling instructions                                                    | N/A                                                              | Clear instructions on how to recycle the item, local recycling info                                                                | Detailed recycling steps and environmental impact information shown                                    | Pass   |
| 6    | Click "Recover" button on an organic/compostable item                          | Item: "Lettuce" (organic waste)                                  | A modal appears with composting guidance following the 4Rs framework                                                               | Modal displays: "Composting Guide - Recover nutrients from organic waste"                              | Pass   |
| 7    | View composting instructions                                                   | N/A                                                              | Step-by-step composting instructions, benefits, and tips are displayed                                                             | Detailed composting guide shown: "How to compost lettuce", "Benefits for soil", "Home composting tips" | Pass   |
| 8    | Click "Complete" or "Done" after taking action                                 | N/A                                                              | Item is marked as processed and removed from Waste Management Bin                                                                  | Item successfully removed from bin, waste reduction stats updated                                      | Pass   |
| 9    | Verify waste tracking statistics                                               | N/A                                                              | Dashboard shows updated waste reduction metrics (e.g., "3 items recovered", "500g waste prevented")                                | Statistics updated: "Waste reduced: 150g", "Sustainability score increased"                            | Pass   |

---

## Additional Test Cases

### TC-011: Email Notification for Expiring Ingredients

| **Field**               | **Details**                                 |
| ----------------------- | ------------------------------------------- |
| **Test Case ID**        | TC-011                                      |
| **Test Design By**      | Andre Miles Calledo                         |
| **Test Design Date**    | October 18, 2025                            |
| **Test Priority**       | Medium                                      |
| **Module Name**         | Notification System                         |
| **Test Executed By**    | James Basti Igcalinos                       |
| **Test Title**          | Email Notification for Expiring Ingredients |
| **Test Execution Date** | October 20, 2025                            |

**Description:** Verifies that users receive email notifications when ingredients are about to expire.

**Pre-conditions:**

- User has enabled notifications in settings
- User has ingredients with expiry dates approaching (1-2 days)

**Dependencies:** Email service (Resend/EmailJS) must be configured.

**Post-conditions:** Email notification is sent to user's registered email address.

| Step | Test Steps                           | Test Data                          | Expected Result                                                       | Actual Result | Status  |
| ---- | ------------------------------------ | ---------------------------------- | --------------------------------------------------------------------- | ------------- | ------- |
| 1    | Set an ingredient to expire in 1 day | Item: "Milk", Expiry: "1 day left" | System should trigger email notification                              | N/A           | Pending |
| 2    | Check user's email inbox             | Email: jamesbasti200@gmail.com     | Email received with subject "Ingredients Expiring Soon - Fridge2Fork" | N/A           | Pending |
| 3    | Verify email content                 | N/A                                | Email lists expiring ingredients and suggests recipes to use them     | N/A           | Pending |

---

### TC-012: User Settings Management

| **Field**               | **Details**              |
| ----------------------- | ------------------------ |
| **Test Case ID**        | TC-012                   |
| **Test Design By**      | Krishnan Mahinay         |
| **Test Design Date**    | October 18, 2025         |
| **Test Priority**       | Low                      |
| **Module Name**         | User Settings            |
| **Test Executed By**    | Andre Miles Calledo      |
| **Test Title**          | User Settings Management |
| **Test Execution Date** | October 20, 2025         |

**Description:** Verifies that users can access and modify their account settings.

**Pre-conditions:** User is logged in.

**Dependencies:** Firestore must be writable.

**Post-conditions:** User settings are updated and persisted.

| Step | Test Steps                                | Test Data       | Expected Result                              | Actual Result | Status  |
| ---- | ----------------------------------------- | --------------- | -------------------------------------------- | ------------- | ------- |
| 1    | Click on user profile icon/name in navbar | N/A             | Dropdown menu appears with "Settings" option | N/A           | Pending |
| 2    | Click "Settings"                          | N/A             | Settings modal/page opens                    | N/A           | Pending |
| 3    | Toggle "Email Notifications" switch       | Toggle ON → OFF | Setting is updated immediately               | N/A           | Pending |
| 4    | Close settings and reopen                 | N/A             | Changed setting persists                     | N/A           | Pending |

---

### TC-013: Responsive Design Validation

| **Field**               | **Details**                  |
| ----------------------- | ---------------------------- |
| **Test Case ID**        | TC-013                       |
| **Test Design By**      | Andre Miles Calledo          |
| **Test Design Date**    | October 19, 2025             |
| **Test Priority**       | High                         |
| **Module Name**         | UI/UX - Responsive Design    |
| **Test Executed By**    | Krishnan Mahinay             |
| **Test Title**          | Responsive Design Validation |
| **Test Execution Date** | October 21, 2025             |

**Description:** Verifies that the application is fully responsive and functional across different devices and screen sizes.

**Pre-conditions:** Application is deployed and accessible.

**Dependencies:** None.

**Post-conditions:** UI renders correctly on all tested devices.

| Step | Test Steps                              | Test Data                 | Expected Result                                                      | Actual Result | Status  |
| ---- | --------------------------------------- | ------------------------- | -------------------------------------------------------------------- | ------------- | ------- |
| 1    | Open application on desktop (1920x1080) | Browser: Chrome           | All elements are properly sized and positioned                       | N/A           | Pending |
| 2    | Open application on tablet (768x1024)   | Browser: Safari on iPad   | Layout adjusts, navigation becomes mobile-friendly                   | N/A           | Pending |
| 3    | Open application on mobile (375x667)    | Browser: Chrome on iPhone | Mobile layout active, hamburger menu visible, cards stack vertically | N/A           | Pending |
| 4    | Test touch interactions on mobile       | N/A                       | All buttons and interactive elements work with touch                 | N/A           | Pending |

---

### TC-014: Data Persistence After Logout

| **Field**               | **Details**                   |
| ----------------------- | ----------------------------- |
| **Test Case ID**        | TC-014                        |
| **Test Design By**      | James Basti Igcalinos         |
| **Test Design Date**    | October 19, 2025              |
| **Test Priority**       | High                          |
| **Module Name**         | Data Persistence              |
| **Test Executed By**    | Krishnan Mahinay              |
| **Test Title**          | Data Persistence After Logout |
| **Test Execution Date** | October 21, 2025              |

**Description:** Verifies that user data (inventory, recipes, meal plans) persists after logout and login.

**Pre-conditions:**

- User is logged in
- User has inventory, generated recipes, and meal plan data

**Dependencies:** Firestore database.

**Post-conditions:** All user data is retained after re-login.

| Step | Test Steps                        | Test Data                                 | Expected Result                                   | Actual Result | Status  |
| ---- | --------------------------------- | ----------------------------------------- | ------------------------------------------------- | ------------- | ------- |
| 1    | Note current inventory items      | Items: "Chicken", "Rice", "Tomato"        | N/A                                               | N/A           | Pending |
| 2    | Note generated recipes count      | Count: 5 recipes                          | N/A                                               | N/A           | Pending |
| 3    | Note meal plan assignments        | Monday: Breakfast, Lunch, Dinner assigned | N/A                                               | N/A           | Pending |
| 4    | Click "Log Out"                   | N/A                                       | User is logged out and redirected to landing page | N/A           | Pending |
| 5    | Log back in with same credentials | Email: jamesbasti200@gmail.com            | Successfully logged in                            | N/A           | Pending |
| 6    | Check inventory                   | N/A                                       | All inventory items persist exactly as before     | N/A           | Pending |
| 7    | Check generated recipes           | N/A                                       | All 5 recipes are still available                 | N/A           | Pending |
| 8    | Check meal plan                   | N/A                                       | Monday's meal assignments remain intact           | N/A           | Pending |

---

### TC-015: SDG 12 Features Display

| **Field**               | **Details**                |
| ----------------------- | -------------------------- |
| **Test Case ID**        | TC-015                     |
| **Test Design By**      | Krishnan Mahinay           |
| **Test Design Date**    | October 19, 2025           |
| **Test Priority**       | Medium                     |
| **Module Name**         | SDG 12 Information Section |
| **Test Executed By**    | Andre Miles Calledo        |
| **Test Title**          | SDG 12 Features Display    |
| **Test Execution Date** | October 21, 2025           |

**Description:** Verifies that the SDG 12 (Sustainable Development Goal) information section displays correctly on the landing page.

**Pre-conditions:** User is on the landing page (not logged in).

**Dependencies:** None.

**Post-conditions:** Users can view SDG 12 sustainability information.

| Step | Test Steps                           | Test Data | Expected Result                                                 | Actual Result | Status  |
| ---- | ------------------------------------ | --------- | --------------------------------------------------------------- | ------------- | ------- |
| 1    | Scroll to SDG 12 section on homepage | N/A       | Section is visible with SDG 12 information                      | N/A           | Pending |
| 2    | Verify 4Rs framework is displayed    | N/A       | Reduce, Reuse, Recycle, Recover principles are explained        | N/A           | Pending |
| 3    | Check sustainability statistics      | N/A       | Impact statistics are displayed (e.g., waste reduction metrics) | N/A           | Pending |
| 4    | Test "Get Started" call-to-action    | N/A       | Button opens signup modal                                       | N/A           | Pending |

---

## Test Results Summary

### Test Execution Summary (as of October 21, 2025)

| **Status**  | **Count** | **Percentage** |
| ----------- | --------- | -------------- |
| **Pass**    | 10        | 66.7%          |
| **Pending** | 5         | 33.3%          |
| **Fail**    | 0         | 0%             |
| **Blocked** | 0         | 0%             |
| **Total**   | 15        | 100%           |

### Module-wise Test Results

| **Module**              | **Total Tests** | **Pass** | **Pending** | **Fail** |
| ----------------------- | --------------- | -------- | ----------- | -------- |
| User Account Management | 2               | 2        | 0           | 0        |
| Ingredient Recognition  | 3               | 3        | 0           | 0        |
| Recipe Generation       | 2               | 2        | 0           | 0        |
| Meal Planning           | 1               | 1        | 0           | 0        |
| Waste Tracking          | 2               | 2        | 0           | 0        |
| Notification System     | 1               | 0        | 1           | 0        |
| User Settings           | 1               | 0        | 1           | 0        |
| UI/UX                   | 1               | 0        | 1           | 0        |
| Data Persistence        | 1               | 0        | 1           | 0        |
| SDG 12 Features         | 1               | 0        | 1           | 0        |

### Critical Issues Found

_None - All executed tests passed successfully_

### Recommendations

1. Complete pending test cases (TC-011 through TC-015) before final deployment
2. Conduct cross-browser testing on Firefox and Safari
3. Perform load testing with multiple concurrent users
4. Implement automated testing for regression testing
5. Add error logging and monitoring for production environment

---

## Test Sign-Off

| **Role**        | **Name**              | **Signature**      | **Date**           |
| --------------- | --------------------- | ------------------ | ------------------ |
| Testing Lead    | Andre Miles Calledo   | ******\_\_\_****** | October 28, 2025   |
| Developer       | James Basti Igcalinos | ******\_\_\_****** | October 28, 2025   |
| Developer       | Krishnan Mahinay      | ******\_\_\_****** | October 28, 2025   |
| Project Advisor | ******\_\_\_******    | ******\_\_\_****** | ******\_\_\_****** |

---

**Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**Next Review Date:** November 5, 2025
