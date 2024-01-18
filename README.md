![admin2](https://github.com/geochrs/shophub-admin/assets/125922884/9ab6e08a-5454-436f-b74b-43d3be461572)

<h1 align="center">
Shophub | Admin Panel
</h1>
<p align="center">

## Features

:radio_button: Secure user registration and authentication. <br>
:radio_button: Add/Edit/Remove products only for admins. <br>
:radio_button: Become admin if u enter the secret code(secret). <br>
:radio_button: Check user orders. <br>

## Technology

The application is built with:

:radio_button: Node.js <br>
:radio_button: MongoDB <br>
:radio_button: Express <br>
:radio_button: Bootstrap <br>
:radio_button: Cloudinary <br>
:radio_button: Passport

## Run it locally


1. Install mongodb
2. Clone the repo locally using:
```
https://github.com/geochrs/shophub-admin.git
cd shophub-admin
npm install 
```
3. Create a `.env` file in the root of the project and add the following:
```
DB_URL='<url>'
CLOUDINARY_CLOUD_NAME='<name>'
CLOUDINARY_KEY='<key>'
CLOUDINARY_SECRET='<secret>'
SECRET='<secret>'
```
4. Run the server :
```
node app.js
go to localhost:3000
```
