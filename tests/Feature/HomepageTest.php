<?php

it('renders the homepage', function () {
    $this->get('/')->assertOk();
});

it('renders the hero heading from the page builder', function () {
    $this->get('/')->assertSee('Extraordinary Cars');
});

it('renders section content from collections', function () {
    $this->get('/')
        ->assertSee('Current Stock')
        ->assertSee('Journal')
        ->assertSee('Dominic Shorthouse');
});
