//<script type="text/javascript" src="wp-content/themes/toynbee/js/panorama-source-switch.js"></script>

;(function( $ ) {

    //names of the panorama image folders. The index pages will display a stiched together 360 panorama
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

        //probably a better way to do this. Nicely formatted names for displaying
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


    var srcString, //String that plugs into the 'src' attribute of the iframe tag on the page-about.php document
        index = 0; //index of the source array

    changeSource(index); //call the change source to set the first source so that the iframe is displaying something when the page is loaded.
                     
    /**
      * Attaching event handlers to the text, next to the iframe. The handlers just add or subtrac tthe index. 
      * They are also limited so that they don't give back any numbers less than 0 or greater than the length of the array.
      * Change source is then called and the new value for the array index is passed through.
      */                 
    $( '#left' ).on( 'click' , function ( event ){
        console.log( this.id );
        index = index - 1;
        if( index < 0 ){
            index = 0;
        }
        changeSource(index);
    })

    $( '#right' ).on( 'click' , function ( event ){
        console.log( this.id );
        index = index + 1;
        if( index > source.length - 1 ){
            index = source.length - 1;   
        }
        changeSource(index);
    })



    function changeSource() {
        
        console.log( source[ index ]  + " " + index );

        //The new string to be used as the 'src'. The source changes depending on the index.
        // Use relative path for static site (about page is at /about/index.html)
        var basePath = '../wp-content/Pano/360_Panoramas_HTML/';
        srcString = basePath + source[ index ] + '/index.html';  

        //Updating the attribute on the iframe with the new string.
        $( '#iframe-pano' ).attr( 'src' , srcString );

          //sets the alt of the iframe to the name of the panorama
        $( '#iframe-pano' ).attr( 'alt', niceNames[ index ] )

        //Outputting one of the formatted names to the markup on the webpage.

        //doesn't display the names of the index that doesn't exist. was returning 'undefined' so this just outputs nothing.
        if( niceNames[ ( index + 1 ) ] !== undefined ){
            $( '#right' ).html("Go to: "  + niceNames[ ( index + 1 ) ] );
        } else {
            $( '#right' ).html("");
        }

        //Exactly the same as the above statement but it does it if the index is less than 0.
        if ( niceNames[ ( index - 1 ) ] !== undefined ){
            $( '#left' ).html("Go to: " + niceNames[ ( index - 1 ) ] );
        } else {
            $( '#left' ).html("");
        }
        
        //shows the name of the current panorama being currently viewed.
        $( '#current' ).html("Currently viewing: " + niceNames[ index ] );    
    }

} )( jQuery );