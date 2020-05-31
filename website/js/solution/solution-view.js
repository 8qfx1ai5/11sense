let solution = {
    tagIdClipboard: "clipboard",

    onDocumentReadyEvent: function() {

        system.events.addEventListener('solution-found', function(e) {

        });

        system.events.addEventListener('partial-solution-found', function(e) {
            text = "<span style='color: green'>" + formatNumberForDisplay(e.detail.input) + "</span> (" + e.detail.parts + ")";
            let entry = document.createElement('p');
            entry.innerHTML = text;
            document.getElementById(solution.tagIdClipboard).prepend(entry);
        });

        system.events.addEventListener('no-solution-found', function(e) {
            let text = formatNumberForDisplay(e.detail.input) + " <span class='hint' onclick='toggleSolution()'>?</span>";
            let entry = document.createElement('p');
            entry.innerHTML = text;
            document.getElementById(solution.tagIdClipboard).prepend(entry);
        });

        system.events.addEventListener('new-task-created', function(e) {
            document.getElementById(solution.tagIdClipboard).innerHTML = "";
        });
    }
};

(function() {
    solution.onDocumentReadyEvent();
})();