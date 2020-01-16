/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */

import { getMessageMock } from '../../test/mocks';
import { handleCommand } from '.';
import * as Discord from 'discord.js';
import Sinon from 'sinon';
import { expect } from 'chai';

describe('index', () => {
  describe('handleCommand', () => {
    it('should show help message', async () => {
      const msg = getMessageMock('msg', { content: '!help' });
      const memberMock = {
        hasPermission: Sinon.spy(),
      };
      msg.guild.fetchMember.resolves(memberMock);
      msg.author.send.resolves();
      await handleCommand((msg as unknown) as Discord.Message);
      expect(msg.reply).to.have.been.calledOnceWith('Wysłałam Ci DM ze wszystkimi komendami! 🎉');
    });
  });
});
