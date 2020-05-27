import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';

import CancelDelivery from '../jobs/CancelDelivery';
import Queue from '../../lib/Queue';

class ProblemController {
  async index(req, res) {
    const problems = await DeliveryProblem.findAll({
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'canceled_at']
        }
      ]
    });
    return res.json(problems);
  }

  async delete(req, res) {
    const { problem_id } = req.params;
    const problem = await DeliveryProblem.findByPk(problem_id);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const order = await Order.findByPk(problem.delivery_id);

    order.canceled_at = new Date();
    order.save();

    const { name, email } = await Deliveryman.findByPk(order.deliveryman_id);
    await Queue.addJob(CancelDelivery.key, {
      to: `${name} <${email}>`,
      context: {
        name,
        product: order.product
      }
    });

    return res.json();
  }
}

export default new ProblemController();
