;(function( $ ) {

    // Names of the panorama image folders
    var source = [
        'Bottom_Stairs',
        'Hallway',
        'Outside',
        'Room_1_With_Chairs',
        'Room_1_Without_Chairs',
        'Room_2_With_Chairs',
        'Room_2_Without_Chairs',
        'Room_3',
        'Room_4',
        'Room_5',
        'Top_Stairs'
    ];

    // Nicely formatted names for displaying
    var niceNames = [
        'Bottom of the stairs',
        'Hallway',
        'Outside',
        'Room 1 with chairs',
        'Room 1 without chairs',
        'Room 2 with chairs',
        'Room 2 without chairs',
        'Room 3',
        'Room 4',
        'Room 5',
        'Top of the stairs'
    ];

    var srcString,
        index = 0;

    // Only run if pano gallery exists on page
    if ($('#pano-gallery').length === 0) return;

    changeSource(index);

    $('#left').on('click', function(event) {
        index = index - 1;
        if (index < 0) {
            index = 0;
        }
        changeSource(index);
    });

    $('#right').on('click', function(event) {
        index = index + 1;
        if (index > source.length - 1) {
            index = source.length - 1;
        }
        changeSource(index);
    });

    function changeSource() {
        // Path to panorama files
        var basePath = '/assets/Pano/360_Panoramas_HTML/';
        srcString = basePath + source[index] + '/index.html';

        $('#iframe-pano').attr('src', srcString);
        $('#iframe-pano').attr('alt', niceNames[index]);

        // Update navigation text
        if (niceNames[(index + 1)] !== undefined) {
            $('#right').html('<span class="pano-arrow">→</span> ' + niceNames[(index + 1)]);
        } else {
            $('#right').html('');
        }

        if (niceNames[(index - 1)] !== undefined) {
            $('#left').html(niceNames[(index - 1)] + ' <span class="pano-arrow">←</span>');
        } else {
            $('#left').html('');
        }

        $('#current').html(niceNames[index]);
    }

})( jQuery );
