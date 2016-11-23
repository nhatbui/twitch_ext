// These are variables for Twitch elements related to chat.
// We expose them here so changes can be easily made if Twitch changes them.
twitchChatUlClass = ".chat-lines";
twitchChatMessageClass1 = ".message-line";
twitchChatMessageClass2 = ".chat-line";
twitchChatMessageContent = ".message";

// Twitch chat message element: rich with media.
var parseMsgHTML = function (msgHTML) {
  var contents = msgHTML.html(
    msgHTML
      .text()
      .replace(
        "bard",
        "<img src='"+ chrome.extension.getURL('assets/bard.png') + "' alt='bard!'/>")
  );
};

// Bard Search
function BardSearcher() {
    // Attach listener that acts when a new chat message appears.
    return new MutationObserver(function (mutations) {
        // For each mutation object, we look for the addedNode object
        mutations.forEach(function (mutation) {
            // A chat message would be an added node
            mutation.addedNodes.forEach(function (addedNode) {
                // At this point it's potentially a chatMessage object.
                var chatMessage = $(addedNode);
                if (!chatMessage.is(twitchChatMessageClass1, twitchChatMessageClass2)) {
                    // this isn't a chat message, skip processing.
                    return;
                }
                // Grab the actual span element with the message content
                var messageElement = chatMessage.children(twitchChatMessageContent);

                parseMsgHTML(messageElement);
            });
        });
    });
}

// configuration of the observer:
var config = {attributes: false, childList: true, characterData: false};

var bardFinder = BardSearcher();

// The chat, particularly the element ".chat-lines", is dynamically loaded.
// We need to wait until the page is done loading everything in order to be
// able to grab it.
// We hijack MutationObserver as a way to check if an added, the chat.
var htmlBody = $("body")[0];
var chatLoadedObserver = new MutationObserver(function (mutations, observer) {
    mutations.forEach(function (mutation) {
        var chatSelector = $(twitchChatUlClass);
        if (chatSelector.length > 0) {
            // Select the node element.
            var target = chatSelector[0];

            // Pass in the target node, as well as the observer options
            // do something
            // add second MutationObserver
            //compakt.observe(target, config);
            bardFinder.observe(target, config);

            // Alert page action that we found a chat and we're going to get to work.
            chrome.runtime.sendMessage({twitchChat: true}, function (response) {
              if (response.registered) {
                console.log("Twitch Chat found.");
              }
            });

            // Unregister chatLoadedObserver. We don't need to check for the chat element anymore.
            observer.disconnect();
        }
    })
});

chatLoadedObserver.observe(htmlBody, config);
