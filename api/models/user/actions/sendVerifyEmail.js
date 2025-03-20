import {
  applyParams,
  save,
  ActionOptions,
  DefaultEmailTemplates,
  Config,
} from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api }) => {
  applyParams(params, record);
  await save(record);
  return {
    result: "ok",
  };
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, emails }) => {
  if (
    !record.emailVerified &&
    record.emailVerificationToken &&
    params.user?.emailVerificationCode
  ) {
    const url = new URL("/verify-email", Config.appUrl);
    url.searchParams.append("code", params.user?.emailVerificationCode);
    // sends the verification email
    await emails.sendMail({
      to: record.email,
      subject: `Verify your email with ${Config.appName}`,
      html: DefaultEmailTemplates.renderVerifyEmailTemplate({
        url: url.toString(),
      }),
    });
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "custom",
  returnType: true,
  triggers: { api: false, sendVerificationEmail: true },
};
