# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Purpose
This project was created by Eunsoo Kim as part of the Lighthouse Labs study curriculum.

## Features
Upon registration/login, the user can create short URLs and share the link even for non-users. The short URLS comes with its own unique id composed of 6 alpha-numeric characters. The user can edit or delete each URL on their 'My URL' page.

## Final Product

The screenshots below show the preview of the webpages:
!["Register Page"](/screenshots/register.png)
!["Create New URL"](/screenshots/newURL.png)
!["Edit Page"](/screenshots/editURL.png)
!["Dashboard"](/screenshots/dashboard.png)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- Morgan

## Dev Dependencies
- Mocha
- Chai
- Nodemon

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command or `npm start`. 
- Enjoy all the features!