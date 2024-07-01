"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  console.debug("getAndShowStoriesOnStart");
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  const isFavorite = currentUser.favorites.some(fav => fav === story.storyId); //used to determined if the story is a favorite
  const starType = isFavorite ? "fas" : "far";  // filled star for favorite, outlined for non-favorite, determines if the star is filled or not by is favorite

  return $(`
    <li id="${story.storyId}">
      <span class="star"><i class="${starType} fa-star"></i></span> <!--span class for it to be inline, star class for favoriting, i tag for icon-->
      <button class="delete-btn">Delete</button> <!-- Add delete button -->
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
}


/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Handle story form submission */
async function submitNewStory(evt) {
  console.debug("submitNewStory", evt);
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();

  const newStory = await storyList.addStory(currentUser, { title, author, url });

  const $story = generateStoryMarkup(newStory);
  $allStoriesList.prepend($story);

  $(".submit-form-container").hide();
  $("#submit-form").trigger("reset");
}

$("#submit-form").on("submit", submitNewStory);

/* Handle favorite/unfavorite a story, implemented code */
async function toggleStoryFavorite(evt) {
  const $tgt = $(evt.target); 
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");

  // If story is currently favorited, remove it from favorited
  if ($tgt.hasClass("fas")) {
    await currentUser.removeFavorite(storyId);
    $tgt.closest("i").toggleClass("fas far"); // toggles between fas far on closet i element, 
  } else { //not currently favorited, add to favorites
    await currentUser.addFavorite(storyId);
    $tgt.closest("i").toggleClass("fas far");
  }
}

// event listener for toggle favorite status
$allStoriesList.on("click", ".star", toggleStoryFavorite);

// function for deleting a story
async function deleteStory(evt) {
  console.debug("deleteStory", evt);
  const $closestLi = $(evt.target).closest("li"); //closet ancestor of the current of selector li
  const storyId = $closestLi.attr("id");

  // delete story from the server
  await storyList.deleteStory(currentUser, storyId);

  // Remove the story from the DOM
  $closestLi.remove();
}

//event listener for deleting a button
$allStoriesList.on("click", ".delete-btn", deleteStory);