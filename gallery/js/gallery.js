/*
 * @author Annie Yin
 */

$(function() {
    
    var pictures = [];
    var slideIndex = 1;
    
    // get pictures from json using ajax
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: './data.json',
        
        success: function (result) {
            for (var i in result) {
                pictures.push(result[i]);
            }
            
            makeSlideshow (pictures);
            makeCheckboxes (pictures);
            addPics (pictures);
            makeModal ();
            getSlideshowInput ();
            getCheckboxInput ();
            implementModal ();
        }
    });
    
    function makeSlideshow (pictures) {
        // make buttons
        $('#slideshow').append('<button id="left" onclick="plusImage(-1)" >&lArr;</button>');
        
        // adding pics to represent each category to the slideshow
        var slideshow = $('#slideshow');
        var usedCategories = [];
        for (var i = 0; i < pictures.length; i++) {
            if (usedCategories.indexOf(pictures[i].category) < 0) {
                var pic = $('<img class="slides" id =' + pictures[i].category + ' src=' + pictures[i].link + ' >');
                pic.appendTo(slideshow);
                usedCategories.push(pictures[i].category);
            }
        }
    
        $('#slideshow').append('<button id="right" onclick="plusImage(1)" >&rArr;</button>');
        
        // styling of slideshow
        $('#slideshow').css('display', 'inline-flex');
        $('#slideshow').css('justify-content', 'center');
        $('#slideshow').css('align-items', 'center');
        $('button').css('font-size', '16px');
        $('button').css('border-radius', '8px');
        
        //var slideIndex = 1;
        showImage(slideIndex);
    }
    
    function plusImage (n) {
        // console.log(slideIndex);
        showImage(slideIndex += n);
    }
    
    function showImage (n) {
        //console.log(slideIndex);
        var images = document.getElementsByClassName('slides');
        // console.log(images);
        if (n > images.length) {
            slideIndex = 1;
        }
        if (n < 1) {
            slideIndex = images.length;
        }
        
        for (var i = 0; i < images.length; i++) {
            images[i].style.display = 'none';
        }
        
        images[slideIndex-1].style.display = 'block';
        images[slideIndex-1].style.margin = '1%';
        images[slideIndex-1].style.marginBottom = '3%';
        images[slideIndex-1].style.width = '50%';
    }
    
    function makeCheckboxes (pictures) {
        // console.log(pictures);
        var categories = [];
        for (var i in pictures) {
            categories.push(pictures[i].category);
        }
        
        // get rid of duplicates
        var categorySet = new Set (categories);
        // categorySetadd('all');
        
        var j = 1;
        for (let item of categorySet) {
            var div = $('<div id=' + item + '/>');
            $('<input/>', {
                type: 'checkbox',
                id: item, 
                name: 'category'
            }).prop('checked', true).appendTo(div);
            div.appendTo('#checkbox');
            div.append(item);
            j += 1;
        }
        
        // modifying css for checkboxes
        $('#checkbox').css('display', 'inline-flex');
        $('#checkbox').css('justify-content', 'space-evenly');
        $('#checkbox').css('color', 'steelblue');
        $('#checkbox').css('width', '100%'); 
        $('#checkbox').css('margin-bottom', '2%'); 
        // $('#checkbox').css('border')
    }
    
    function getSlideshowInput () {
        $('.slides').click(function () {
            var category = $(this).attr('id');
            $('figure').each(function () {
                if ($(this).attr('class') == category) {
                    $(this).show();
                } else { $(this).hide(); };
            });
        });
    }
    
    function getCheckboxInput () {
        // var checked = [];
        $('input').click(function () {
            $('input').each(function () {
                var checked = $(this).prop('checked');
                var category = $(this).attr('id');
                $('figure').each(function () {
                    if ($(this).attr('class') == category) {
                        checked ? $(this).show() : $(this).hide();
                    }
                });
            });
        });
    }
    
    function addPics (pictures) {
        for (var i = 0; i < pictures.length; i++) {
            var picDiv = $('<figure class=' + pictures[i].category + '/>');
            var image = $('<img class="original" src=' + pictures[i].link + ' >');
            // set alt
            image.attr('alt', pictures[i].caption);
            picDiv.append(image);
            $('#gallery').append(picDiv);
        }
        
        // set style 
        $('.original').css('width', '350px');
        $('.original').css('max-width', '100%');
        $('.original').css('max-height', '450px');
        $('.original').hover(function () {
            $(this).css('opacity', '0.8');
            }, function () {
            $(this).css('opacity', '1');
        });
        $('#gallery').css('display', 'inline-flex');
        $('#gallery').css('flex-wrap', 'wrap');
        $('#gallery').css('justify-content', 'center');
        $('#gallery').css('align-content', 'space-around');
        $('figure').css('text-align', 'center');
    }
    
    function makeModal () {
        // set up modal
        var modal = $('<div class="modal"/>');
        modal.append($('<span class="close">&times;</span>'));
        modal.append($('<img id="modal-image">'));
        modal.append($('<div id="caption"/>'));
        $('body').append(modal);
        
        // set style
        $('.modal').css('display', 'none');
        $('.modal').css('position', 'fixed');
        $('.modal').css('z-index', '1');
        $('.modal').css('padding-top', '100px');
        $('.modal').css('left', '0');
        $('.modal').css('top', '0');
        $('.modal').css('overflow', 'auto');
        $('.modal').css('width', '100%');
        $('.modal').css('height', '100%');
        $('.modal').css('background-color', 'rgba(128, 128, 128, 0.9)');
        
        $('#modal-image').css('margin', 'auto');
        $('#modal-image').css('display', 'block');
        // $('#modal-image').css('width', '70%');
        $('#modal-image').css('max-width', '700px');
        
        $('#caption').css('margin', 'auto');
        $('#caption').css('padding-top', '1%');
        $('#caption').css('display', 'block');
        $('#caption').css('text-align', 'center');
        $('#caption').css('color', 'white');
        
        $('.close').css('position', 'absolute');
        $('.close').css('top', '4%');
        $('.close').css('right', '6%');
        $('.close').css('color', 'white');
        $('.close').css('font-size', '40px');
    }
    
    function implementModal () {
        // get modal
        var modal = $('.modal');
        // get original image
        var image = $('.original');
        var modalImage = $('#modal-image');
        var caption = $('#caption');
        
        // if click on image
        image.click(function () {
            modal.css('display', 'block');
            modalImage.attr('src', $(this).attr('src'));
            caption.text($(this).attr('alt'));
        });
        
        var span = $('.close');
        
        span.hover(function () {
            $(this).css('cursor', 'pointer');
            }, function () {
            $(this).css('cursor', 'auto');
        });
        
        span.click(function () {
            modal.css('display', 'none');
        });
    }
    
});