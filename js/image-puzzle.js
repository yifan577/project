var timerFunction;

var imagePuzzle = {
    stepCount: 0,
    startTime: new Date().getTime(),
    // 最佳记录
    loadBestRecord: function (difficulty) {
        var raw = localStorage.getItem('puzzle_best_' + difficulty);
        return raw ? JSON.parse(raw) : null;
    },
    saveBestRecord: function (difficulty, steps, seconds) {
        var current = this.loadBestRecord(difficulty);
        if (!current || seconds < current.seconds) {
            localStorage.setItem('puzzle_best_' + difficulty, JSON.stringify({ steps: steps, seconds: seconds }));
            return true;
        }
        return false;
    },
    renderBestRecords: function () {
        var levels = { '3': '简单', '4': '中等', '5': '困难' };
        var html = '';
        for (var lv in levels) {
            var rec = imagePuzzle.loadBestRecord(lv);
            html += '<div class="best-row"><b>' + levels[lv] + '</b> — ';
            html += rec ? rec.steps + '步 / ' + rec.seconds + '秒' : '暂无记录';
            html += '</div>';
        }
        $('#bestPanel').html(html);
    },

    startGame: function (images, gridSize) {
        this.setImage(images, gridSize);
        $('#playPanel').show();
        $('#sortable').randomize();
        this.enableSwapping('#sortable li');
        this.stepCount = 0;
        this.startTime = new Date().getTime();
        this.tick();
        this.renderBestRecords();
    },
    tick: function () {
        var now = new Date().getTime();
        var elapsedTime = parseInt((now - imagePuzzle.startTime) / 1000, 10);
        $('#timerPanel').text(elapsedTime);
        timerFunction = setTimeout(imagePuzzle.tick, 1000);
    },
    enableSwapping: function (elem) {
        $(elem).draggable({
            snap: '#droppable',
            snapMode: 'outer',
            revert: "invalid",
            helper: "clone"
        });
        $(elem).droppable({
            drop: function (event, ui) {
                var $dragElem = $(ui.draggable).clone().replaceAll(this);
                $(this).replaceAll(ui.draggable);

                currentList = $('#sortable > li').map(function (i, el) { return $(el).attr('data-value'); });
                if (isSorted(currentList)) {
                    var nowDone = new Date().getTime();
                    var elapsed = parseInt((nowDone - imagePuzzle.startTime) / 1000, 10);
                    $('.timeCount').text(elapsed);
                    // 记录最佳成绩
                    var gridSize = $('#levelPanel :radio:checked').val();
                    imagePuzzle.saveBestRecord(gridSize, imagePuzzle.stepCount + 1, elapsed);
                    imagePuzzle.renderBestRecords();
                    $('#actualImageBox').empty().html($('#gameOver').html());
                }
                else {
                    var now = new Date().getTime();
                    imagePuzzle.stepCount++;
                    $('.stepCount').text(imagePuzzle.stepCount);
                    $('.timeCount').text(parseInt((now - imagePuzzle.startTime) / 1000, 10));
                }

                imagePuzzle.enableSwapping(this);
                imagePuzzle.enableSwapping($dragElem);
            }
        });
    },

    setImage: function (images, gridSize) {
        console.log(gridSize);
        gridSize = gridSize || 4; // If gridSize is null or not passed, default it as 4.
        console.log(gridSize);
        var percentage = 100 / (gridSize - 1);
        var image = images[Math.floor(Math.random() * images.length)];
        $('#imgTitle').html(image.title);
        $('#actualImage').attr('src', image.src);
        $('#sortable').empty();
        for (var i = 0; i < gridSize * gridSize; i++) {
            var xpos = (percentage * (i % gridSize)) + '%';
            var ypos = (percentage * Math.floor(i / gridSize)) + '%';
            var li = $('<li class="item" data-value="' + (i) + '"></li>').css({
                'background-image': 'url(' + image.src + ')',
                'background-size': (gridSize * 100) + '%',
                'background-position': xpos + ' ' + ypos,
                'width': 400 / gridSize,
                'height': 400 / gridSize
            });
            $('#sortable').append(li);
        }
        $('#sortable').randomize();
    }
};

function isSorted(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
        if (arr[i] != i)
            return false;
    }
    return true;
}
$.fn.randomize = function (selector) {
    var $elems = selector ? $(this).find(selector) : $(this).children(),
        $parents = $elems.parent();

    $parents.each(function () {
        $(this).children(selector).sort(function () {
            return Math.round(Math.random()) - 0.5;
        }).remove().appendTo(this);
    });
    return this;
};