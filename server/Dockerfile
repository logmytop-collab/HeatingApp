FROM node:24

WORKDIR /app

COPY package*.json ./

RUN yarn install

# RUN chmod +x ~/pin.sh
# ENV PATH="$PATH"

COPY . .

# USER root

# RUN chmod +x ./pinctrl/runpinctrl.sh

RUN groupadd -f gpio 

CMD ["npm", "run", "start"]


