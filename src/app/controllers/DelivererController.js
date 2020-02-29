import * as Yup from 'yup';

import Deliverer from '../models/Deliverer';
import File from '../models/File';

class DelivererController {
  async index(req, res) {
    const deliverers = await Deliverer.findAll({
      attributes: ['id', 'name', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url']
        }
      ]
    });
    return res.json(deliverers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, name, email } = await Deliverer.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const deliverer_id = req.params.id;
    const deliverer = await Deliverer.findByPk(deliverer_id);

    if (!deliverer) {
      return res.status(404).json({ error: 'Deliverer not found' });
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, name, email } = await deliverer.update(req.body);
    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const deliverer_id = req.params.id;
    const deliverer = await Deliverer.findByPk(deliverer_id);

    if (!deliverer) {
      return res.status(404).json({ error: 'Deliverer not found' });
    }

    await deliverer.destroy();

    return res.send();
  }
}

export default new DelivererController();
