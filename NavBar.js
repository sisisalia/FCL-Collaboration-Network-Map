$( function() {
    var show = 1;
    $("#slider-range").slider({
        range: true,
        min: 2015,
        max: 2020,
        step: 1,
        values: [2015, 2020],
        // slide: function( event, ui ) {
        //   $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
        // }
    });
    // $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
    //   " - $" + $( "#slider-range" ).slider( "values", 1 ) );

    $('#slider-range').slider().slider('pips');

       $('.ui-slider-handle').css('background-color', 'white');
       $('.ui-slider-handle').css('border-radius', '1px');
       $('.ui-slider-handle').css('height', '20px');
       $('.ui-slider-handle').css('width', '8px');
       $('.ui-slider-handle').css('box-shadow', '0 1px 2px 0 rgba(0,0,0,0.5);');
       $('.ui-slider-handle').css('margin-top', '-7px');
       $('.ui-slider-handle').css('margin-left', '-3px');

//        isVisible = $('.navbar-toggler').is(':visible');
//        if(isVisible == 1){
//            $('.navbar').width('80%');
//            nav_width = $('.navbar').width() -100;
//            $('#slider-range').width(nav_width);
//            $('.side-menu').css('margin-left', '250px');
//            $('.side-menu').css('margin-top', '0');
//        }else
//        {
//            $('.navbar').width('20%');
//            nav_width = $('.navbar').width() - 100;
//            $('#slider-range').width(nav_width);
//            var nav_width = parseInt(nav_width) + 100 + 'px';
//            $('.side-menu').css('margin-left', nav_width);
//            $('.side-menu').css('margin-top', '-300px');
//        }

    $('[id^="submenu3-"]').on('click',function(){
        var content = $(this).text();
        $('#submenu3result').append('<div>' + content + '<span id="' + $(this).attr('id') + '"class="glyphicon glyphicon-remove-circle"></span></div>');
        $(this).attr('disabled', true);
    });

    $(document).on('click','.glyphicon-remove-circle',function(){
        var id = $(this).attr('id');
        $(this).parent().remove();
        ($('#' + id).removeAttr('disabled'));
    });

//        function resize(){
//            isVisible = $('.navbar-toggler').is(':visible');
//            if(isVisible == 1){
//                $('.navbar').width('80%');
//                nav_width = $('.navbar').width() -100;
//                $('#slider-range').width(nav_width);
//                $('.side-menu').css('margin-left', '250px');
//                $('.side-menu').css('margin-top', '0');
//            }else
//            {
//                $('.navbar').width('20%');
//                nav_width = $('.navbar').width() - 100;
//                $('#slider-range').width(nav_width);
//                var nav_width = parseInt(nav_width) + 100 + 'px';
//                $('.side-menu').css('margin-left', nav_width);
//                $('.side-menu').css('margin-top', '-300px');
//            }
//
//        }
});
