(function() {
    currentTask = document.getElementById('current-task');
    currentSolution = document.getElementById('solution');
    tempSolutions = document.getElementById('temp-solutions')
    f1input = document.getElementById('f1')
    f2input = document.getElementById('f2')
    navigation = document.getElementById('nav')
    Solution = document.getElementById('Solution')
    psolutions = document.getElementById('partial-solutions')

    SolutionTask = document.getElementById('Solution-task')
    autoTaskInput = document.getElementById('autoTaskInput')
    trainerPage = document.getElementById('trainer-page')
    header = document.getElementById('header')

    window.addEventListener("keydown", function(e) {

        if (e.keyCode == '13' || e.keyCode == '32') {
            // enter or space
            saveTempSolution();
        } else if (e.keyCode == '78') {
            // n
            newTask();
        } else if (e.keyCode == '83') {
            // s              
            toggleSolution();
            currentSolution.focus();
        } else if (e.keyCode == '79') {
            // o
            toggleNav();
        } else if (e.keyCode == '70') {
            // f
            toggleFullScreen();
            currentSolution.focus();
        } else if (e.keyCode == '86') {
            // V
            toggleVoiceMode();
            enterFullscreen();
            currentSolution.focus();
        }
    });
})();