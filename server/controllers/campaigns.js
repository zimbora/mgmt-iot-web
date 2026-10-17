const Joi = require('joi');
const Campaigns = require('../models/campaigns');
const response = require('./response');

const id = Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER);
const schema = Joi.object({
  name: Joi.string().trim().max(255).required(),
  variant_id: id.allow(null).default(null),
  firmware_id: Joi.alternatives().try(id, Joi.valid('latest')).required(),
  build_release: Joi.string().valid('prod', 'staging', 'dev').default('prod'),
  all_devices: Joi.boolean().default(false),
  device_ids: Joi.when('all_devices', {
    is: true, then: Joi.array().length(0).default([]),
    otherwise: Joi.array().items(id.required()).unique().min(1).required()
  })
});

function failure(res, err) {
  response.error(res, err.status || 500, err.status ? err.message : 'Unable to process FOTA campaign');
}

module.exports = {
  checkAccess: (req, res, next) => {
    if (!(req.user?.level >= 4)) return response.error(res, 403, 'Only administrators can manage FOTA campaigns');
    if (id.required().validate(req.params.model_id).error) return response.error(res, 400, 'Invalid model ID');
    next();
  },
  options: async (req, res) => {
    try { response.send(res, await Campaigns.options(req.params.model_id)); }
    catch (err) { failure(res, err); }
  },
  list: async (req, res) => {
    try { response.send(res, await Campaigns.list(req.params.model_id)); }
    catch (err) { failure(res, err); }
  },
  targets: async (req, res) => {
    if (id.required().validate(req.params.campaign_id).error) return response.error(res, 400, 'Invalid campaign ID');
    try { response.send(res, await Campaigns.targets(req.params.model_id, req.params.campaign_id)); }
    catch (err) { failure(res, err); }
  },
  create: async (req, res) => {
    const value = schema.validate(req.body);
    if (value.error) return response.error(res, 400, value.error.details[0].message);
    try {
      const campaign = await Campaigns.create(req.params.model_id, value.value);
      res.status(202).json({ Error: false, Message: 'Campaign dispatch started', Result: campaign });
      setImmediate(() => Campaigns.dispatch(campaign).catch(err => console.error('FOTA campaign dispatch failed', err)));
    } catch (err) { failure(res, err); }
  }
};
