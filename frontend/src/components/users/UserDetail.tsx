import { formatDateStr } from "~/utils/datetime";

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  profile_id: number;
  target_id: number;
  privacy_level: string;
  is_active: boolean;
  is_staff: boolean;
  email_verified: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  is_private: boolean;
  is_followed: boolean;
  followers: any[];
  following: any[];
  follower_count: number;
  following_count: number;
  last_login: string;
  updated_at: string;
  created_at: string;
};

type UserDetailProps = {
  data: User;
};

export default function UserDetail(props: UserDetailProps) {
  return (
    <table class="w-full border-collapse">
      <tbody>
        <tr>
          <th class="w-1/2 border p-2 text-left">Name</th>
          <td class="w-1/2 border p-2 text-right">{props.data.name}</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Username</th>
          <td class="w-1/2 border p-2 text-right">{props.data.username}</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Email</th>
          <td class="w-1/2 border p-2 text-right">{props.data.email}</td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Email Verified</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.email_verified?.toString()}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Privacy Level</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.privacy_level}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Active</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.is_active?.toString()}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Staff</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.is_staff?.toString()}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Superuser</th>

          <td class="w-1/2 border p-2 text-right">
            {props.data.is_superuser?.toString()}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Last Login</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.last_login ? formatDateStr(props.data.last_login) : "-"}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Created</th>
          <td class="w-1/2 border p-2 text-right">
            {formatDateStr(props.data.created_at)}
          </td>
        </tr>
        <tr>
          <th class="w-1/2 border p-2 text-left">Updated</th>
          <td class="w-1/2 border p-2 text-right">
            {props.data.updated_at ? formatDateStr(props.data.updated_at) : "-"}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
