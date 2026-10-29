import { FormControl, FormGroup } from '@angular/forms';
import { matchFields, strongPassword } from './password.validators';

describe('password validators', () => {
  it('requires a letter and a number', () => {
    expect(strongPassword(new FormControl('abcdefgh'))).toEqual({ weakPassword: true });
    expect(strongPassword(new FormControl('12345678'))).toEqual({ weakPassword: true });
    expect(strongPassword(new FormControl('abcd1234'))).toBeNull();
  });

  it('reports mismatching fields on the group', () => {
    const group = new FormGroup(
      { password: new FormControl('abcd1234'), confirm: new FormControl('abcd1235') },
      { validators: matchFields('password', 'confirm') },
    );
    expect(group.hasError('fieldsMismatch')).toBe(true);
    group.controls.confirm.setValue('abcd1234');
    expect(group.hasError('fieldsMismatch')).toBe(false);
  });
});
