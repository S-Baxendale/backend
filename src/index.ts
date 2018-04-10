import 'reflect-metadata'
import {Action, BadRequestError, createKoaServer} from "routing-controllers"
import setupDb from './db'
import {verify} from "./jwt";

const port = process.env.PORT || 4008

const app = createKoaServer({
  cors: true,
  controllers: [
    //..
  ],
  currentUserChecker: async (action: Action) => {
    const header: string = action.request.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const [ , token ] = header.split(' ')

      if (token) {
        const {id} = verify(token)
        //return User.findOne({where: {id}})
      }
    }
    return undefined
  },
  authorizationChecker: (action: Action) => {
    const header: string = action.request.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const [ , token ] = header.split(' ')

      try {
        return !!(token && verify(token))
      }
      catch (e) {
        throw new BadRequestError(e)
      }
    }

    return false
  }
})

setupDb()
  .then(_ => {
    app.listen(port, () => console.log(`Listening on port ${port}`))
  })
  .catch(err => console.error(err))
