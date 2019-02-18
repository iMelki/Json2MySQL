# Json2MySQL
The task is to take a JSON file and dynamically pass all its documents into a MySQL database table ('accountsDB.accounts').


## Getting Started
These instructions will get you a copy of the project on your local machine to run or test. 
```
git clone https://github.com/iMelki/Json2MySQL.git
```

Before first run: 
Edit the configuration file as you wish.
It can be found under the projects main folder, named 'config.json'.


### Prerequisites
Node.js


### Installing
Download & Install [Node.js](https://nodejs.org/en/)
Go to the directory of the app
Enter the command:
```
npm install
```



## Running the app
Go to the directory of the app.\n
Open the config.json file and edit it with the arguments of your choise.\n
Choose a database table that fits the Schema, or choose a non-existing one to be created.\n
Now, this command will run the app on your local machine.\n

```
node index.js [%file_path% [%DB_name% [%table_name%]]]
```

Note: to see app's progress with debug comments in the console:
```
SET DEBUG=* & node index.js [%file_path% [%DB_name% [%table_name%]]]
``` 

Where %filePath% should be replaced with the input JSON file path,\n
%DB_name% should be replaced with the database name\n
and %table_name% should be replaced with the table name.
If not specified, they'll be taken from the configuration file.



## Author
* **iMelki** 


## License
This project is licensed under the GNU GPL v3.0 License - see the [LICENSE.md](LICENSE.md) file for details

