document.addEventListener('DOMContentLoaded', () => {

  $('.participants-slider').slick({
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: true,
    infinite: false,
    dots: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          dots: true,
          arrows: false
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 420,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  })


  $('.mobmenu-button').click(function () {
    if (!$(this).hasClass('active')) {
      $(this).addClass('active');
      $('.mobmenu-button img').attr("src", "images/dist/mobmenu-button-close.svg")
    } else {
      $(this).removeClass('active');
      $('.mobmenu-button img').attr("src", "images/dist/mobmenu-button-burger.svg")
    }

    $('body').toggleClass('scroll-locked');
    $('.mobile-menu').toggleClass('active');

  })



  let mediaTablet = () => {
    if (window.matchMedia("(max-width: 992px)").matches) {
      $('.main-menu').appendTo('.mobile-menu__top-links');
    }

    if (window.matchMedia("(min-width: 993px)").matches) {
      $('.main-menu').appendTo('.menu-col');
    }

    if (window.matchMedia("(max-width: 768px)").matches) {
      $('.copyright').appendTo('.footer-row');
    }

    if (window.matchMedia("(min-width: 768px)").matches) {
      $('.copyright').appendTo('.footer-col__left');
    }

    if (window.matchMedia("(max-width: 576px)").matches) {
      $('.promo-angle').attr("src", "images/dist/promo-angle-down.svg")
    }

    if (window.matchMedia("(min-width: 576px)").matches) {
      $('.promo-angle').attr("src", "images/dist/promo-angle.svg")
    }

  }


  // It could be disable resize function if it caused user device high load
  $(window).resize(function () {
    mediaTablet();
  });
  mediaTablet();

})
