import { VandorPayload } from './Vandor.dto'
import {CustomerPayload} from './Customer.dto'


export type AuthPayload = VandorPayload|CustomerPayload ;