import { useContext } from 'react'
import { ProfileContext } from 'src/context/ProfileContext'

export const useProfile = () => useContext(ProfileContext)
