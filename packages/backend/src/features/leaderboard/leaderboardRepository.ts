import PointsModel, { IPoints } from '../../database/models/PointsModel'

async function createPoints(pointsData: IPoints) {
  const newPoints = new PointsModel(pointsData)
  return newPoints.save()
}

async function getLeaderboard() {
  return await PointsModel.aggregate([
    {
      $group: {
        _id: '$address',
        totalPoints: { $sum: '$points' }
      }
    },
    { $sort: { totalPoints: -1 } },
    { $project: { address: '$_id', totalPoints: 1, _id: 0 } }
  ])
}

const leaderboardRepository = {
  createPoints,
  getLeaderboard
}

export default leaderboardRepository
