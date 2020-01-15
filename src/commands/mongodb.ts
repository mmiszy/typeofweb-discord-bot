import { Command } from '../types';

const mongodb: Command = {
  name: 'mongodb',
  description: 'Mongo is webscale!',
  args: false,
  cooldown: 300,
  execute(msg) {
    return msg.channel.send('https://youtu.be/b2F-DItXtZs');
  },
};

export default mongodb;
