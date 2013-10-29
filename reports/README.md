Authentication
--------------

These scripts require authentication against your account.

The scripts use the `.netrc` file in your home directory to get the username and password.

To add the correct element in vi the .netrc file in your home dir and add the following.

    machine html5rocks.com
      login your_user_name
      password your_personal_access_token

Do not use your password visit [https://github.com/settings/applications](https://github.com/settings/applications) and create a Personal Access Token - you can then revoke it at anytime.
