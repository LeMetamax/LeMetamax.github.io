'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');
if (menuButton && navigation) {
    function closeMenu() {
        menuButton.setAttribute('aria-expanded', 'false');
        navigation.classList.remove('is-open');
    }
    menuButton.addEventListener('click', () => {
        const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!isOpen));
        navigation.classList.toggle('is-open', !isOpen);
    });
    const links = navigation.querySelectorAll('a');
    for (let index = 0; index < links.length; index++) {
        links[index].addEventListener('click', closeMenu);
    }
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            closeMenu();
            menuButton.focus();
        }
    });
    const desktop = window.matchMedia('(min-width: 701px)');
    desktop.addEventListener('change', closeMenu);
}

const years = document.querySelectorAll('[data-year]');
for (let index = 0; index < years.length; index++) {
    years[index].textContent = String(new Date().getFullYear());
}

const lightbox = document.querySelector('.lightbox');
if (lightbox) {
    const image = lightbox.querySelector('img');
    const caption = lightbox.querySelector('[data-caption]');
    const closeButton = lightbox.querySelector('button');
    const galleryButtons = document.querySelectorAll('[data-gallery]');
    for (let index = 0; index < galleryButtons.length; index++) {
        galleryButtons[index].addEventListener('click', () => {
            const thumbnail = galleryButtons[index].querySelector('img');
            image.src = thumbnail.src;
            image.alt = thumbnail.alt;
            caption.textContent = thumbnail.alt;
            lightbox.showModal();
        });
    }
    closeButton.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            const bounds = lightbox.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
                lightbox.close();
            }
        }
    });
    lightbox.addEventListener('close', () => {
        image.removeAttribute('src');
        document.documentElement.style.overflow = '';
    });
    lightbox.addEventListener('toggle', () => {
        document.documentElement.style.overflow = lightbox.open ? 'hidden' : '';
    });
}
