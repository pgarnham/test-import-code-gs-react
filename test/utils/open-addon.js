const { default: axios } = require('axios');

const openAddon = async (page) => {
  await page.goto(process.env.SHEET_URL);

  await page.click('a:nth-child(2)'); // click on signin button

  await page.waitForSelector('input[name="identifier"]', { visible: true });
  await page.type('input[name="identifier"]', process.env.EMAIL); // type email
  await page.click('#identifierNext'); // click "next" button

  await page.waitForSelector('input[name="password"]', { visible: true });
  await page.type('input[name="password"]', process.env.PASSWORD); // type pass
  await page.waitForTimeout(500);

  await page.click('#passwordNext'); // click "next" button
  await page.waitForTimeout(3000);

  if (
    // some kind of verification screen appears
    await page.evaluate(
      () =>
        document.querySelector('h1#headingText') &&
        document.querySelector('h1#headingText').innerText.includes('erify')
    )
  ) {
    // first print html and save pic
    console.log('on some verification page');
    console.log(await page.evaluate(() => document.body.outerHTML));
    await page.screenshot({
      path: './test/__image_snapshots__/verification_screenshot_1.png',
    });
    await page.waitForTimeout(1000);

    // check if on verification page, too many tries, need to choose "use recovery email" method:
    if (
      await page.evaluate(() =>
        document
          .querySelector('body')
          .innerText.includes('onfirm your recovery email')
      )
    ) {
      // first print html and save pic
      console.log('page contains recovery email');

      await page
        .evaluate(
          "//div[contains(., 'Confirm your recovery email')]",
          document,
          null,
          XPathResult.ANY_TYPE,
          null
        )
        .iterateNext()
        .click();
      await page.waitForTimeout(3000);
    } else if (
      // already on verification code page
      await page.evaluate(() => document.querySelector('input[name="idvPin"]'))
    ) {
      // first print html and save pic
      console.log('page has idvPin input');

      let response;
      axios.get(process.env.VERIFICATION_SHEET_URL).then((res) => {
        response = res.data;
      });
      const verificationCode = response.values[0][0];

      console.log('verificationCode', verificationCode);
      await page.type('input[name="idvPin"]', verificationCode); // type verification code
      await page.waitForTimeout(6000);
      await page.click('button'); // click "next" button
      await page.waitForTimeout(5000);

      // first print html and save pic
      console.log('typed in idvPin, clicked button, on new page');
      console.log(await page.evaluate(() => document.body.outerHTML));
      await page.screenshot({
        path: './test/__image_snapshots__/verification_screenshot_2.png',
      });
      await page.waitForTimeout(1000);
    }

    try {
      await page.click('div[data-accountrecovery]');
      await page.waitForTimeout(6000);
    } catch {
      // eslint-disable-next-line no-console
      console.log('The "choose account recovery method" page isn\'t shown');
    }

    // first print html and save pic
    console.log('clicked go to recovery email page');
    console.log(await page.evaluate(() => document.body.outerHTML));
    await page.screenshot({
      path: './test/__image_snapshots__/verification_screenshot_3.png',
    });
    await page.waitForTimeout(1000);

    await page.type(
      'input[name="knowledgePreregisteredEmailResponse"]',
      process.env.TEST_RECOVERY_EMAIL
    ); // type recovery email
    await page.waitForTimeout(6000);
    await page.click('button'); // click "next" button
    await page.waitForTimeout(5000);
  }

  await page.waitForSelector(
    'div.menu-button.goog-control.goog-inline-block:nth-child(11)',
    { visible: true }
  );

  // open new addon menubar item
  await page.evaluate(() => {
    const addOnMenuButton = document.querySelector(
      'div.menu-button.goog-control.goog-inline-block:nth-child(11)'
    );
    addOnMenuButton.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true })
    );
    addOnMenuButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });

  await page.waitForSelector(
    'div.goog-menu.goog-menu-vertical.apps-menu-hide-mnemonics:last-child > div:nth-child(2) > div',
    { visible: true }
  );

  // open "bootstrap" menu item
  await page.evaluate(() => {
    const bootstrapMenuButton = document.querySelector(
      'div.goog-menu.goog-menu-vertical.apps-menu-hide-mnemonics:last-child > div:nth-child(2) > div'
    );
    bootstrapMenuButton.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true })
    );
    bootstrapMenuButton.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true })
    );
    bootstrapMenuButton.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true })
    );
    bootstrapMenuButton.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true })
    );
  });
  await page.waitForSelector('.script-app-dialog', {
    visible: true,
    timeout: 10000,
  });

  await page.waitForTimeout(3000);
};

module.exports = { openAddon };
