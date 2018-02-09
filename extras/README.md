# Additional files and information

## DynamoDB Configuration
Three tables are expected: aonComment, aonImage, aonRating

### aonComment
**Primary Partition Key**: imageId
**Primary Sort Key**: timestamp

### aonImages
**Primary Partition Key**: userName
**Primary Sort Key**: imageName

### aonRating
**Primary Partition Key**: imageId
**Primary Sort Key**: userName

## Lambda Functions
These are stored in files with the name of the function as the file name and _'lambda'_ as the extension


