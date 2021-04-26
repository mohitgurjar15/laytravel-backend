#
# Created on Tue APR 25 2021
#
# @Auther:- Parth Virani
# Copyright (c) 2020 Oneclick
# my variables are ${myvar1} and ${myvar2}
#

# base directory 
FROM node:12

# commands 

WORKDIR /app
ADD package.json /app/package.json
RUN npm install
ADD . /app

# Expose the port the app runs in
EXPOSE 4040

CMD ["npm", "run", "start"]