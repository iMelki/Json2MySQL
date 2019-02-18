# Json2MySQL
The task is to take a JSON file and dynamically pass all its documents into a MySQL database table.


## Getting Started
These instructions will get you a copy of the project on your local machine to run or test. 
```
git clone https://github.com/iMelki/Json2MySQL.git
```


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
Before first run:  
Go to the directory of the app.  
Open the configuration file (config.json) and edit it with the arguments of your choise.  
Choose a database table that fits the Schema, or choose a non-existing one to be created.  
  
Now, this command will run the app on your local machine:

```
node index.js [%file_path% [%DB_name% [%table_name%]]]
```
  
Note: to see app's progress with debug comments in the console:
```
SET DEBUG=* & node index.js [%file_path% [%DB_name% [%table_name%]]]
``` 
  
Where %filePath% should be replaced with the input JSON file path,  
%DB_name% should be replaced with the database name  
and %table_name% should be replaced with the table name.  
They're not mandatory. If not specified, they'll be taken from the configuration file instead.  



## Author
* **iMelki** 


## License
This project is licensed under the GNU GPL v3.0 License - see the [LICENSE.md](LICENSE.md) file for details

