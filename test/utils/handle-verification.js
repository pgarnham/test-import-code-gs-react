/* eslint-disable no-console */
const { default: axios } = require('axios');

const handleVerification = async (page) => {
  if (
    // some kind of verification screen appears
    await page.evaluate(
      () =>
        document.querySelector('h1#headingText') &&
        document.querySelector('h1#headingText').innerText.includes('erify')
    )
  ) {
    // first print html and save pic
    console.log('On some verification page. Printing body:');
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
      console.log(
        'Page contains recovery email text. Try clicking on option to confirm by recovery email'
      );

      await page
        .$x("//div[contains(., 'Confirm your recovery email')]")[0]
        .click();
      await page.waitForTimeout(3000);
    } else if (
      // Check if we went straight to verification code page
      await page.evaluate(() => document.querySelector('input[name="idvPin"]'))
    ) {
      // first print html and save pic
      console.log('We are on code verification page. Page has idvPin input.');

      // Wait 30 seconds to retrieve code and put in spreadsheet located at VERIFICATION_SHEET_URL location
      await page.waitForTimeout(30000);

      let response;
      axios.get(process.env.VERIFICATION_SHEET_URL).then((res) => {
        response = res.data;
      });
      // Get code from first response at values array (e.g. A1 cell value)
      const verificationCode = response.values[0][0];

      await page.type('input[name="idvPin"]', verificationCode); // type verification code
      await page.waitForTimeout(6000);
      await page.click('button'); // click "next" button
      await page.waitForTimeout(5000);

      // first print html and save pic
      console.log('Typed in code, clicked button, now print page body:');
      console.log(await page.evaluate(() => document.body.outerHTML));
      await page.screenshot({
        path: './test/__image_snapshots__/post_verification_code_submit.png',
      });
      await page.waitForTimeout(1000);
    }

    // Assume we are now on verify-by-recovery-email page:
    try {
      // This used to sometimes be the only option on the page. This may need to be updated if there are always multiple options.
      await page.click('div[data-accountrecovery]');
      await page.waitForTimeout(6000);
    } catch {
      console.log('The "choose account recovery method" page isn\'t shown');
    }

    // first print html and save pic
    console.log('Clicked go to recovery email page. Print new body:');
    console.log(await page.evaluate(() => document.body.outerHTML));
    await page.screenshot({
      path: './test/__image_snapshots__/verification_by_recovery_email_page.png',
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
};

module.exports = { handleVerification };
