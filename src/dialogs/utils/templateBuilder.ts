import * as ACData from "adaptivecards-templating";

export const buildTemplate = (JSONTemplate: Object, payload?: Object) => {
  // Load the template from a JSON
  const template = new ACData.Template(JSONTemplate);

  // Replace the "variables" inside the JSON template with the values defined in
  // the "payload"
  const builtCard = template.expand({ $root: payload });

  return builtCard;
};
