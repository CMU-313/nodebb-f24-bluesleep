# User Guide
**Authors**: Angela Kim, Veronica Pimenova, Crystal Cheng, Eric Lin

This is the user documentation for our project. It explains the features, setup instructions, and usage details.

## Table of Contents
- [Feature Descriptions](#feature-descriptions)
  - [Feature 1: Anonymous Posting](#feature-1-anonymous-posting)
  - [Feature 2: isAnswered](#feature-2-isanswered)
  - [Feature 3: Emoji Reactions](#feature-3-emoji-reactions)
- [Implementation Details](#implementation-details)
  - [Feature 1: Anonymous Posting](#implementation-details-feature-1-anonymous-posting)
  - [Feature 2: isAnswered](#implementation-details-feature-2-isanswered)
  - [Feature 3: Emoji Reactions](#implementation-details-feature-3-emoji-reactions)
- [Testing](#testing)
  - [Feature 1: Anonymous Posting](#testing-feature-1-anonymous-posting)
  - [Feature 2: isAnswered](#testing-feature-2-isanswered)
  - [Feature 3: Emoji Reactions](#testing-feature-3-emoji-reactions)
- [Usage](#usage)
  - [Feature 1: Anonymous Posting](#usage-feature-1-anonymous-posting)
  - [Feature 2: isAnswered](#usage-feature-2-isanswered)
  - [Feature 3: Emoji Reactions](#usage-feature-3-emoji-reactions)
- [Automated Tests](#automated-tests)

---

## Feature Descriptions

### Feature 1: Anonymous Posting
The Anonymous Posting feature allows users to make a post without having their name/profile attached to the post publicly. This feature provides more flexibility for users, giving them the option to post anonymously.

**Key Functionality**:
- **Mark post as anonymous**: When drafting a post, users will see a checkbox that allows them to modify the anonymous status of the post.
- **Post displays as anonymous**: Upon posting, the post shows up without a profile picture or name associated with the post author.

### Feature 2: isAnswered
The `isAnswered` feature helps track the status of topics in the forum, allowing users to identify which topics have received a satisfactory response. It is useful for Q&A or support forums where users focus on unanswered queries.

**Key Functionality**:
- **Mark Topics as Answered**: Users with the necessary privileges can mark a topic as answered.
- **Display Answer Status**: The status (`Answered` or `Unanswered`) is displayed on the topic list view.
- **Restrict Marking Privileges**: The ability to toggle the `isAnswered` status can be restricted to specific users.

### Feature 3: Emoji Reactions
The Emoji Reactions feature lets users express their sentiments on posts by reacting with emojis. This provides a lightweight and intuitive way for users to engage with posts.

**Key Functionality**:
- **React to Posts**: Users can choose from a set of emojis to react to a post.
- **View Reactions**: The total number of reactions and specific emojis used are displayed under each post.
- **Remove Reactions**: Users can remove their reactions if they no longer wish to associate them with a post.

---

## Implementation Details

### Implementation Details: Feature 1 (Anonymous Posting)
- **Backend Field Handling**: A field `isAnonymous` is added to handle the server requests associated with a post’s anonymity.
  - Relevant Files: `src/posts/summary.js`, `src/topics/create.js`
- **Backend Schema**: The schema was expanded to include the `isAnonymous` field to match the response body of operations.
- **Frontend UI**: A checkbox shows up next to the topic title for users to handle the anonymous state of each post.
- **Integration**: When the checkbox is checked and a post is published, a frontend trigger reflects this change.

### Implementation Details: Feature 2 (isAnswered)
- **Backend Schema**: A new column `isAnswered` was added to the `topics` table in the database to store the status of each topic.
- **API Endpoint (Internal)**:
  - Endpoint: `/post/:pid/answered`
  - Method: `PUT`
  - Body: `{ "isAnswered": true }`
- **Frontend UI**:
  - Checkbox Display: A checkbox is added next to each post. It is checked if the post is answered and unchecked if unanswered.
  - UI Placement: The checkbox is visible both in the main topic list and within the post detail view.

### Implementation Details: Feature 3 (Emoji Reactions)
- **Backend Schema**: No new column was added. Emoji reactions leverage NodeBB’s existing reaction system.
- **API Endpoints**:
  - **Add Reaction**:
    - Endpoint: `/post/:pid/reaction`
    - Method: `PUT`
    - Body: `{ "reaction": "😊" }`
  - **Remove Reaction**:
    - Endpoint: `/post/:pid/reaction`
    - Method: `DELETE`
    - Body: `{ "reaction": "😊" }`
- **Frontend UI**:
  - Emoji Picker: Users see an emoji reaction icon next to the post content. Clicking it opens the emoji picker.
  - Displaying Reactions: Selected emojis and counts are displayed below the post content.

---

## Testing

### Testing: Feature 1 (Anonymous Posting)
- **Front-End Testing**:
  - Verify that the anonymous checkbox is visible in the post creation UI.
  - Ensure the checkbox hides the user’s name and profile picture when posting.
- **Back-End Testing**:
  - Test that the `isAnonymous` field updates correctly in the database.
  - Verify the anonymous status persists across sessions.

### Testing: Feature 2 (isAnswered)
- **Front-End Testing**:
  - Ensure the checkbox toggles between "answered" and "unanswered" states.
  - Verify the status is reflected correctly in both topic list and detail views.
- **Back-End Testing**:
  - Test the API to confirm it updates the `isAnswered` status correctly.
  - Verify that the database saves and retrieves the correct status.

### Testing: Feature 3 (Emoji Reactions)
- **Front-End Testing**:
  - Ensure the emoji picker appears and allows users to react to posts.
  - Test that the reactions display correctly under the post and can be removed.
- **Back-End Testing**:
  - Test the API to confirm reactions are added and removed correctly in the database.
  - Verify that emoji counts update correctly when multiple users react.

---

## Usage

### Usage: Feature 1 (Anonymous Posting)
1. **Setting a post as anonymous**:
   - Under a discussion, click "Create Topic".
   - Check the "anonymous" checkbox near the post title.
   - Submit the post.
2. **Viewing Anonymous Posts**:
   - The post will display as any other post but without the author’s name or profile picture.
3. **Permissions**:
   - Only the original poster can toggle the anonymous status.

### Usage: Feature 2 (isAnswered)
1. **Marking a Post as Answered or Unanswered**:
   - Navigate to the post, locate the checkbox next to the title, and toggle it.
2. **Viewing Status**:
   - In the topic list and post view, the checkbox will indicate the post's current status.
3. **Permissions**:
   - Only the original poster or users with permissions can toggle the answer status.

### Usage: Feature 3 (Emoji Reactions)
1. **Adding a Reaction**:
   - Navigate to the post and click the emoji icon.
   - Select an emoji from the picker, and it will display under the post.
2. **Removing a Reaction**:
   - Click on your selected emoji to remove it.
3. **Viewing Reactions**:
   - Reactions and counts are visible under the post content.

---

## Automated Tests
- The automated tests for these features can be found in the `/tests/` directory. These tests cover both front-end and back-end functionality for the Anonymous Posting, isAnswered, and Emoji Reactions features.

**Testing Coverage**:
- The tests include basic functionality, user interaction scenarios, and edge cases, ensuring the robustness of the features. We believe the tests are sufficient as they verify key user interactions, API calls, and data persistence across sessions.

---

This document should cover all the necessary aspects of your user guide and testing information in a clear and structured manner. Let me know if you need further adjustments!
