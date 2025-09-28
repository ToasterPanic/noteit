# Noteit

A web app with notes and cloud syncing.



https://github.com/user-attachments/assets/68540064-375e-4370-a0be-64ce1946e4f2



## Deployment

You'll need NPM and Node installed, of course.

```bash
git clone https://github.com/toasterpanic/noteit
cd noteit

npm install
```

From here, rename the `userdata_example` folder to `userdata`. Then,

```bash
npm start
```

Note that when you log into one session, you revoke the token for the other session and will need to re-log on that session to sync.

## Configuration

You can edit the `config.yaml` file to change your server's configuration. All configuration options are documented inside the config. Once you have finished editing it, you must restart the server for the changes to take effect.

There's also things you can change in a user's `usrconfig.yml` file.

Many config settings do not work; I got too ambitious with this project and will work on it later, when I get the chance.

You can also edit configuration items for a user in the `usrconfig.yml` file of a user.
