/* eslint-disable*/
import {login,logout} from './login'
import {displayMap} from './mapbox'
import { updateSettings } from './updateSettings';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    console.log(locations)
    displayMap(locations);
}

if(loginForm){
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password);
      });
} 

if(logOutBtn){
    logOutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
} 
  
if (userDataForm)
  userDataForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const form = new FormData();

    form.append('name',document.getElementById('name').value);
    form.append('email',document.getElementById('email').value);
    form.append('photo',document.getElementById('photo').files[0]);

    await updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordcurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmpassword = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordcurrent, password, confirmpassword },
      'password'  
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });